import * as realFs from 'fs';
import { basename } from 'path';
import iterateSources from './iterateSources';
import Options, { DEFAULT_EXTENSIONS } from './Options';
import TransformRunner, { Source, SourceTransformResult } from './TransformRunner';

function printHelp(argv: Array<string>, out: NodeJS.WritableStream) {
  let $0 = basename(argv[1]);

  out.write(`
${$0} [OPTIONS] [PATH … | --stdio]

OPTIONS
  -p, --plugin PLUGIN               Transform sources with PLUGIN (allows multiple).
  -o, --plugin-options PLUGIN=OPTS  JSON-encoded OPTS for PLUGIN (allows multiple).
  -r, --require PATH                Require PATH before transform (allows multiple).
      --extensions EXTS             Comma-separated extensions to process (default: "${Array.from(DEFAULT_EXTENSIONS).join(',')}").
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

  # Run with a plugin which itself is transpiled using babel.
  $ ${$0} -r babel-register -p ./some-plugin.js src/

  # Run with a plugin written in TypeScript.
  $ ${$0} -r ts-node/register -p ./some-plugin.ts src/
  `.trim());
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

  options.loadRequires();

  let plugins = options.getBabelPlugins();
  let runner: TransformRunner;
  let stats = {
    modified: 0,
    total: 0,
    errors: 0
  };
  let dryRun = options.dry;

  if (options.stdio) {
    runner = new TransformRunner([new Source('<stdin>', await readStream(stdin))][Symbol.iterator](), plugins, {
      transformSourceEnd(runner: TransformRunner, transformed: SourceTransformResult) {
        if (transformed.output) {
          stdout.write(`${transformed.output}\n`);
        } else if (transformed.error) {
          stderr.write(`${transformed.error.stack}\n`);
        }
      }
    });
  } else {
    let sourcesIterator = iterateSources(
      options.sourcePaths,
      options.extensions,
      options.ignore,
      fs.statSync,
      fs.readdirSync,
      fs.readFileSync,
    );

    runner = new TransformRunner(sourcesIterator, plugins, {
      transformSourceEnd(runner: TransformRunner, transformed: SourceTransformResult) {
        if (transformed.output) {
          if (transformed.output !== transformed.source.content) {
            stats.modified++;
            stdout.write(`${transformed.source.path}\n`);
            if (!dryRun) {
              fs.writeFileSync(transformed.source.path, transformed.output);
            }
          }
        } else if (transformed.error) {
          stderr.write(`Encountered an error while processing ${transformed.source.path}:\n`);
          stderr.write(`${transformed.error.stack}\n`);
        }
      }
    });
  }

  let hasErrors = false;

  for (let result of runner.run()) {
    if (result.error !== null) {
      stats.errors++;
      hasErrors = true;
    }
    stats.total++;
  }

  if (!options.stdio) {
    if (dryRun) {
      stdout.write('DRY RUN: no files affected\n');
    }

    stdout.write(`${stats.total} file(s), ${stats.modified} modified, ${stats.errors} errors\n`);
  }

  // exit status is number of errors up to byte max value
  return Math.min(stats.errors, 255);
}

/**
 * Reads stdin and resolves to the read string.
 */
async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise<string>(resolve => {
    let code = '';

    stream.on('data', data => {
      code += data;
    });

    stream.on('end', () => {
      resolve(code);
    });
  });
}
