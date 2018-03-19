import * as realFs from 'fs';
import getStream = require('get-stream');
import { basename } from 'path';
import iterateSources from './iterateSources';
import Options, { DEFAULT_EXTENSIONS } from './Options';
import ProcessSnapshot from './ProcessSnapshot';
import TransformRunner, { BabelPlugin, Source } from './TransformRunner';

function printHelp(argv: Array<string>, out: NodeJS.WritableStream) {
  let $0 = basename(argv[1]);

  out.write(
    `
${$0} [OPTIONS] [PATH … | --stdio]

OPTIONS
  -p, --plugin PLUGIN               Transform sources with PLUGIN (allows multiple).
      --remote-plugin URL           Fetch a plugin from URL (allows multiple).
  -o, --plugin-options PLUGIN=OPTS  JSON-encoded OPTS for PLUGIN (allows multiple).
  -r, --require PATH                Require PATH before transform (allows multiple).
      --extensions EXTS             Comma-separated extensions to process (default: "${Array.from(
        DEFAULT_EXTENSIONS
      ).join(',')}").
      --[no-]transpile-plugins      Transpile plugins to enable future syntax (default: on).
      --[no-]find-babel-config      Run plugins through babel plugins/presets specified in local
                                    .babelrc file instead of babel-preset-env (default: off).
  -s, --stdio                       Read source from stdin and print to stdout.
  -d, --dry                         Run plugins without modifying files on disk.
      --version                     Print the version of ${$0}.
  -h, --help                        Show this help message.

  NOTE: \`--remote-plugin\` should only be used as a convenience to load code that you or someone
        you trust wrote. It will run with your full user privileges, so please exercise caution!

EXAMPLES
  # Run with a relative plugin on all files in \`src/\`.
  $ ${$0} -p ./typecheck.js src/

  # Run with a remote plugin from astexplorer.net on all files in \`src/\`.
  $ ${$0} --remote-plugin 'https://astexplorer.net/#/gist/688274…' src/

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
  $ ${$0} -p ./some-plugin.ts src/
  `.trim()
  );
  out.write('\n');
}

function printVersion(argv: Array<string>, out: NodeJS.WritableStream) {
  out.write(require('../package.json').version);
  out.write('\n');
}

export default async function run(
  argv: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
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

  if (options.version) {
    printVersion(argv, stdout);
    return 0;
  }

  let snapshot = new ProcessSnapshot();
  let plugins: Array<BabelPlugin>;

  try {
    options.loadBabelTranspile();
    options.loadRequires();
    plugins = await options.getBabelPlugins();
  } finally {
    options.unloadBabelTranspile();
    snapshot.restore();
  }

  let runner: TransformRunner;
  let stats = {
    modified: 0,
    total: 0,
    errors: 0
  };
  let dryRun = options.dry;
  let sourcesIterator: IterableIterator<Source>;

  if (options.stdio) {
    sourcesIterator = [new Source('<stdin>', await getStream(stdin))][
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

  let dim = stdout.isTTY ? '\x1b[2m' : '';
  let reset = stdout.isTTY ? '\x1b[0m' : '';

  for (let result of runner.run()) {
    if (result.output) {
      if (options.stdio) {
        stdout.write(`${result.output}\n`);
      } else {
        if (result.output === result.source.content) {
          stdout.write(`${dim}${result.source.path}${reset}\n`);
        } else {
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
