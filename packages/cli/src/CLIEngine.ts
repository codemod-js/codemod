import getStream = require('get-stream')
import { PluginItem } from '@babel/core'
import Config from './Config'
import InlineTransformer from './InlineTransformer'
import iterateSources from './iterateSources'
import { RealSystem, System } from './System'
import TransformRunner, {
  Source,
  SourceTransformResult,
  SourceTransformResultKind,
} from './TransformRunner'

export class RunResult {
  constructor(readonly stats: RunStats) {}
}

export class RunStats {
  constructor(
    readonly modified: number = 0,
    readonly errors: number = 0,
    readonly total: number = 0
  ) {}
}

export default class CLIEngine {
  constructor(
    readonly config: Config,
    readonly onTransform: (result: SourceTransformResult) => void = () => {
      // do nothing by default
    },
    readonly sys: System = RealSystem
  ) {}

  private async loadPlugins(): Promise<Array<PluginItem>> {
    await this.config.loadBabelTranspile()
    this.config.loadRequires()
    return await this.config.getBabelPlugins()
  }

  async run(): Promise<RunResult> {
    const plugins = await this.loadPlugins()
    let modified = 0
    let errors = 0
    let total = 0
    const dryRun = this.config.dry
    let sources: Array<Source>

    if (this.config.stdio) {
      sources = [new Source('<stdin>', await getStream(this.sys.stdin))]
    } else {
      sources = iterateSources(
        this.config.sourcePaths,
        this.config.extensions,
        this.sys
      )
    }

    const runner = new TransformRunner(sources, new InlineTransformer(plugins))

    for await (const result of runner.run()) {
      this.onTransform(result)

      if (result.kind === SourceTransformResultKind.Transformed) {
        if (this.config.stdio) {
          this.sys.stdout.write(result.output)
        } else {
          if (result.output !== result.source.content) {
            modified++
            if (!dryRun) {
              this.sys.writeFile(result.source.path, result.output, 'utf8')
            }
          }
        }
      } else if (result.error) {
        errors++
      }

      total++
    }

    return new RunResult(new RunStats(modified, errors, total))
  }
}
