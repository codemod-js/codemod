import * as realFs from 'fs';
import getStream = require('get-stream');
import Config from './Config';
import iterateSources from './iterateSources';
import ProcessSnapshot from './ProcessSnapshot';
import TransformRunner, {
  BabelPlugin,
  Source,
  SourceTransformResult
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

  async run(): Promise<RunResult> {
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

    runner = new TransformRunner(sourcesIterator, plugins);

    for (let result of runner.run()) {
      if (result.output) {
        this.onTransform(result);
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
