import * as realFs from 'fs';
import { basename } from 'path';
import iterateSources from './iterateSources';
import Options, { DEFAULT_EXTENSIONS } from './Options';
import TransformRunner, { Source } from './TransformRunner';

function printHelp(argv: Array<string>, out: NodeJS.WritableStream) {
  let $0 = basename(argv[1]);

  out.write(
    `
${$0} [OPTIONS] [PATH … | --stdio]

OPTIONS
  -p, --plugin PLUGIN               Transform sources with PLUGIN (allows multiple).
  -o, --plugin-options PLUGIN=OPTS  JSON-encoded OPTS for PLUGIN (allows multiple).
  -r, --require PATH                Require PATH before transform (allows multiple).
      --extensions EXTS             Comma-separated extensions to process (default: "${Array.from(
        DEFAULT_EXTENSIONS
      ).join(',')}").
      --[no-]transpile-plugins      Transpile plugins to enable future syntax (default: on).
      --[no-]find-babel-config      Run plugins through babel plugins/presets specified in local
                                    .babelrc file instead of babel-preset-env (default: off).
  -s, --stdio                       Read source from stdin and print to stdout.
  -h, --help                        Show this help message.
  -d, --dry                         Run plugins without modifying files on disk.

EXAMPLES
  # Run with a relative plugin on all files in \`src/\`.
  $ ${$0} -p ./typecheck.js src/

  # Run with multiple plugins.
  $ ${$0} -p ./a.js -p ./b.js some-file.js

  # Run with a plugin in \`node_modules\` on stdin.
  $ ${$0} -s -p babel-plugin-typecheck <<EOS
  function add(a: number, b: number): number {
    return a + b;
  }
  EOS

  # Pass options to a plugin.
  $ ${$0} -p ./a.js -o a='{"foo":true}' src/

  # Pass options from a config file to a plugin.
  $ ${$0} -p ./a.js -o a=@opts.json src/

  # Run with a plugin written in TypeScript.
  $ ${$0} -r ts-node/register -p ./some-plugin.ts src/
  `.trim()
  );
  out.write('\n');
}

export default async function run(
  argv: Array<string>,
  stdin: NodeJS.ReadableStream,
  stdout: NodeJS.WritableStream,
  stderr: NodeJS.WritableStream,
  fs: typeof realFs = realFs
): Promise<number> {
  let options = Options.parse(argv.slice(2));

  if (options instanceof Error) {
    stderr.write(`ERROR: ${options.message}\n`);
    printHelp(argv, stderr);
    return 1;
  }

  if (options.help) {
    printHelp(argv, stdout);
    return 0;
  }

  options.loadBabelTranspile();

  options.loadRequires();

  let plugins = options.getBabelPlugins();
  let runner: TransformRunner;
  let stats = {
    modified: 0,
    total: 0,
    errors: 0
  };
  let dryRun = options.dry;
  let sourcesIterator: IterableIterator<Source>;

  if (options.stdio) {
    sourcesIterator = [new Source('<stdin>', await readStream(stdin))][
      Symbol.iterator
    ]();
  } else {
    sourcesIterator = iterateSources(
      options.sourcePaths,
      options.extensions,
      options.ignore,
      fs.statSync,
      fs.readdirSync,
      fs.readFileSync
    );
  }

  runner = new TransformRunner(sourcesIterator, plugins);

  for (let result of runner.run()) {
    if (result.output) {
      if (options.stdio) {
        stdout.write(`${result.output}\n`);
      } else {
        if (result.output !== result.source.content) {
          stats.modified++;
          stdout.write(`${result.source.path}\n`);
          if (!dryRun) {
            fs.writeFileSync(result.source.path, result.output);
          }
        }
      }
    } else if (result.error) {
      stats.errors++;

      if (!options.stdio) {
        stderr.write(
          `Encountered an error while processing ${result.source.path}:\n`
        );
      }

      stderr.write(`${result.error.stack}\n`);
    }

    stats.total++;
  }

  if (!options.stdio) {
    if (dryRun) {
      stdout.write('DRY RUN: no files affected\n');
    }

    stdout.write(
      `${stats.total} file(s), ${stats.modified} modified, ${
        stats.errors
      } errors\n`
    );
  }

  // exit status is number of errors up to byte max value
  return Math.min(stats.errors, 255);
}

/**
 * Reads a stream and resolves to the read string.
 */
async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let result = '';

    stream.on('readable', () => {
      let chunk = stream.read();

      if (chunk instanceof Buffer) {
        result += chunk.toString('utf8');
      } else if (typeof chunk === 'string') {
        result += chunk;
      }
    });

    stream.on('end', () => {
      resolve(result);
    });

    stream.on('error', error => {
      reject(error);
    });
  });
}
