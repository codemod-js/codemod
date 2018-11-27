import * as realFs from 'fs';
import getStream = require('get-stream');
import { BabelPlugin } from './BabelPluginTypes';
import Config from './Config';
import InlineTransformer from './InlineTransformer';
import iterateSources from './iterateSources';
import ProcessSnapshot from './ProcessSnapshot';
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
    readonly readStdin: () => Promise<string> = async () =>
      await getStream(process.stdin),
    readonly writeStdout: (data: string) => void = (data: string) =>
      process.stdout.write(data),
    readonly fs: typeof realFs = realFs
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
      sourcesIterator = [new Source('<stdin>', await this.readStdin())][
        Symbol.iterator
      ]();
    } else {
      sourcesIterator = iterateSources(
        this.config.sourcePaths,
        this.config.extensions,
        this.config.ignore,
        this.fs.statSync,
        this.fs.readdirSync,
        this.fs.readFileSync
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
          this.writeStdout(result.output);
        } else {
          if (result.output !== result.source.content) {
            modified++;
            if (!dryRun) {
              this.fs.writeFileSync(result.source.path, result.output);
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
