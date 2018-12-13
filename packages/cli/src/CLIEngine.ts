import getStream = require('get-stream');
import { BabelPlugin } from './BabelPluginTypes';
import Config from './Config';
import InlineTransformer from './InlineTransformer';
import iterateSources from './iterateSources';
import ProcessSnapshot from './ProcessSnapshot';
import { RealSystem, System } from './System';
import TransformRunner, {
  Source,
  SourceTransformResult,
  SourceTransformResultKind
} from './TransformRunner';

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
    readonly onTransform: (result: SourceTransformResult) => void = () => {},
    readonly sys: System = RealSystem
  ) {}

  private async loadPlugins(): Promise<Array<BabelPlugin>> {
    let snapshot = new ProcessSnapshot();
    let plugins: Array<BabelPlugin>;

    try {
      this.config.loadBabelTranspile();
      this.config.loadRequires();
      plugins = await this.config.getBabelPlugins();
    } finally {
      this.config.unloadBabelTranspile();
      snapshot.restore();
    }

    return plugins;
  }

  async run(): Promise<RunResult> {
    let plugins = await this.loadPlugins();
    let runner: TransformRunner;
    let modified = 0;
    let errors = 0;
    let total = 0;
    let dryRun = this.config.dry;
    let sourcesIterator: IterableIterator<Source>;

    if (this.config.stdio) {
      sourcesIterator = [
        new Source('<stdin>', await getStream(this.sys.stdin))
      ][Symbol.iterator]();
    } else {
      sourcesIterator = iterateSources(
        this.config.sourcePaths,
        this.config.extensions,
        this.config.ignore,
        this.sys
      );
    }

    runner = new TransformRunner(
      sourcesIterator,
      new InlineTransformer(plugins, this.config.findBabelConfig)
    );

    for await (let result of runner.run()) {
      this.onTransform(result);

      if (result.kind === SourceTransformResultKind.Transformed) {
        if (this.config.stdio) {
          this.sys.stdout.write(result.output);
        } else {
          if (result.output !== result.source.content) {
            modified++;
            if (!dryRun) {
              this.sys.writeFile(result.source.path, result.output, 'utf8');
            }
          }
        }
      } else if (result.error) {
        errors++;
      }

      total++;
    }

    return new RunResult(new RunStats(modified, errors, total));
  }
}
