import { PluginItem } from '@babel/core'
import { promises as fs } from 'fs'
import { Config } from './Config'
import { InlineTransformer } from './InlineTransformer'
import { iterateSources } from './iterateSources'
import {
  TransformRunner,
  Source,
  SourceTransformResult,
  SourceTransformResultKind,
} from './TransformRunner'
import getStream = require('get-stream')

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

export class CLIEngine {
  constructor(
    readonly config: Config,
    readonly onTransform: (result: SourceTransformResult) => void = () => {
      // do nothing by default
    }
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
    let sources: AsyncGenerator<Source>

    if (this.config.stdio) {
      sources = (async function* getStdinSources(): AsyncGenerator<Source> {
        yield new Source('<stdin>', await getStream(process.stdin))
      })()
    } else {
      sources = iterateSources(this.config.sourcePaths, {
        extensions: this.config.extensions,
      })
    }

    const runner = new TransformRunner(
      sources,
      new InlineTransformer(plugins, this.config.parserPlugins)
    )

    for await (const result of runner.run()) {
      this.onTransform(result)

      if (result.kind === SourceTransformResultKind.Transformed) {
        if (this.config.stdio) {
          process.stdout.write(result.output)
        } else {
          if (result.output !== result.source.content) {
            modified++
            if (!dryRun) {
              await fs.writeFile(result.source.path, result.output, 'utf8')
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
