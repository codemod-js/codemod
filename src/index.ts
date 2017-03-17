import { existsSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import iterateSources, { PathPredicate } from './iterateSources';
import TransformRunner, { Plugin, Source, SourceTransformResult } from './TransformRunner';

const DEFAULT_EXTENSIONS = new Set(['.js', '.jsx']);

function printHelp(out: NodeJS.WritableStream) {
  let $0 = basename(process.argv[1]);

  out.write(`
${$0} [OPTIONS] [PATH … | --stdio]

OPTIONS
  -p, --plugin PLUGIN     Transform sources with PLUGIN (allows multiple).
  -r, --require PATH      Require PATH before transform (allows multiple).
      --extensions EXTS   Comma-separated extensions to process (default: "${Array.from(DEFAULT_EXTENSIONS).join(',')}").
  -s, --stdio             Read source from stdin and print to stdout.
  -h, --help              Show this help message.

EXAMPLES
  # Run with a relative plugin on all files in \`src/\`.
  $ ${$0} -p ./typecheck.js src/

  # Run with multiple plugins
  $ ${$0} -p ./a.js -p ./b.js some-file.js

  # Run with a plugin in \`node_modules\` on stdin.
  $ ${$0} -s -p babel-plugin-typecheck <<EOS
  function add(a: number, b: number): number {
    return a + b;
  }
  EOS

  # Run with a plugin which itself is transpiled using babel.
  $ ${$0} -r babel-register -p ./some-plugin.js src/

  # Run with a plugin written in TypeScript.
  $ ${$0} -r ts-node/register -p ./some-plugin.ts src/
  `.trim());
  out.write('\n');
}

export default async function run(args: Array<string>) {
  let options = Options.parse(args);

  if (options instanceof Error) {
    process.stderr.write(`ERROR: ${options.message}\n`);
    printHelp(process.stderr);
    process.exit(1);
    return;
  }

  if (options.help) {
    printHelp(process.stdout);
    process.exit(0);
    return;
  }

  options.loadRequires();

  let plugins = options.getPlugins();
  let runner: TransformRunner;

  if (options.stdio) {
    runner = new TransformRunner([new Source('<stdin>', await readStdin())][Symbol.iterator](), plugins, {
      transformSourceEnd(runner: TransformRunner, transformed: SourceTransformResult) {
        if (transformed.output) {
          process.stdout.write(transformed.output);
        } else if (transformed.error) {
          console.error(transformed.error.stack);
        }
      }
    });
  } else {
    runner = new TransformRunner(iterateSources(options.sourcePaths, options.extensions, options.ignore), plugins, {
      transformSourceEnd(runner: TransformRunner, transformed: SourceTransformResult) {
        if (transformed.output) {
          if (transformed.output !== transformed.source.content) {
            console.log(transformed.source.path);
            writeFileSync(transformed.source.path, transformed.output);
          }
        } else if (transformed.error) {
          console.error(`Encountered an error while processing ${transformed.source.path}:`);
          console.error(transformed.error.stack);
        }
      }
    });
  }

  let hasErrors = false;

  for (let result of runner.run()) {
    if (result.error !== null) {
      hasErrors = true;
    }
  }

  process.exit(hasErrors ? 1 : 0);
}

type ParseOptionsResult = Options | Error;

class Options {
  private plugins?: Array<Plugin>;

  constructor(
    readonly sourcePaths: Array<string>,
    readonly pluginFilePaths: Array<string>,
    readonly extensions: Set<string>,
    readonly requires: Array<string>,
    readonly ignore: PathPredicate,
    readonly stdio: boolean,
    readonly help: boolean,
  ) {}

  getPlugins(): Array<Plugin> {
    if (!this.plugins) {
      this.plugins = this.loadPlugins();
    }

    return this.plugins;
  }

  loadRequires() {
    for (let modulePath of this.requires) {
      require(modulePath);
    }
  }

  private loadPlugins(): Array<Plugin> {
    return this.pluginFilePaths.map(pluginFilePath => {
      let exports = require(pluginFilePath);

      if (exports.default) {
        return exports.default;
      } else {
        return exports;
      }
    });
  }

  static parse(args: Array<string>): ParseOptionsResult {
    let sourcePaths: Array<string> = [];
    let pluginFilePaths: Array<string> = [];
    let extensions = DEFAULT_EXTENSIONS;
    let ignore = (path: string, basename: string, root: string) => basename[0] === '.';
    let requires: Array<string> = [];
    let stdio = false;
    let help = false;

    for (let i = 0; i < args.length; i++) {
      let arg = args[i];

      switch (arg) {
        case '-p':
        case '--plugin':
          i++;
          pluginFilePaths.push(getRequirableModulePath(args[i]));
          break;

        case '-r':
        case '--require':
          i++;
          requires.push(getRequirableModulePath(args[i]));
          break;

        case '--extensions':
          i++;
          extensions = new Set(
            args[i]
              .split(',')
              .map(ext => ext[0] === '.' ? ext : `.${ext}`)
          );
          break;

        case '-s':
        case '--stdio':
          stdio = true;
          break;

        case '-h':
        case '--help':
          help = true;
          break;

        default:
          if (arg[0] === '-') {
            throw new Error(`unexpected option: ${arg}`);
          } else {
            sourcePaths.push(arg);
          }
          break;
      }
    }

    return new Options(
      sourcePaths,
      pluginFilePaths,
      extensions,
      requires,
      ignore,
      stdio,
      help
    );
  }
}

/**
 * Gets a path that can be passed to `require` for a given module path.
 */
function getRequirableModulePath(modulePath: string): string {
  if (existsSync(modulePath) || existsSync(modulePath + '.js')) {
    return resolve(modulePath);
  } else {
    return modulePath;
  }
}

/**
 * Reads stdin and resolves to the read string.
 */
async function readStdin(): Promise<string> {
  return new Promise<string>(resolve => {
    let code = '';

    process.stdin.on('data', data => {
      code += data;
    });

    process.stdin.on('end', () => {
      resolve(code);
    });
  });
}
