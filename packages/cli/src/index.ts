import { basename } from 'path';
import CLIEngine from './CLIEngine';
import Config from './Config';
import Options, { Command } from './Options';
import { RealSystem, System } from './System';
import {
  SourceTransformResult,
  SourceTransformResultKind
} from './TransformRunner';

// Polyfill `Symbol.asyncIterator` so `for await` will work.
if (!Symbol.asyncIterator) {
  Symbol['asyncIterator' as string] =
    Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
}

function optionAnnotation(
  value: boolean | Array<string> | Map<string, object> | string
): string {
  if (Array.isArray(value) || value instanceof Map) {
    return ' (allows multiple)';
  } else if (typeof value === 'boolean') {
    return ` (default: ${value ? 'on' : 'off'})`;
  } else if (typeof value === 'string') {
    return ` (default: ${value})`;
  } else {
    return '';
  }
}

function printHelp(argv: Array<string>, out: NodeJS.WritableStream): void {
  const $0 = basename(argv[1]);
  const defaults = new Config();

  out.write(
    `
${$0} [OPTIONS] [PATH … | --stdio]

OPTIONS
  -p, --plugin PLUGIN               Transform sources with PLUGIN${optionAnnotation(
    defaults.localPlugins
  )}.
      --remote-plugin URL           Fetch a plugin from URL${optionAnnotation(
        defaults.remotePlugins
      )}.
  -o, --plugin-options PLUGIN=OPTS  JSON-encoded OPTS for PLUGIN${optionAnnotation(
    defaults.pluginOptions
  )}.
  -r, --require PATH                Require PATH before transform${optionAnnotation(
    defaults.requires
  )}.
      --add-extension EXT           Add an extension to the list of supported extensions.
      --extensions EXTS             Comma-separated extensions to process (default: "${Array.from(
        defaults.extensions
      ).join(',')}").
      --source-type                 Parse as "module", "script", or "unambiguous" (meaning babel
                                    will try to guess, default: "${
                                      defaults.sourceType
                                    }").
      --[no-]transpile-plugins      Transpile plugins to enable future syntax${optionAnnotation(
        defaults.transpilePlugins
      )}.
      --[no-]find-babel-config      Run plugins through babel plugins/presets specified in local
                                    .babelrc file instead of babel-preset-env${optionAnnotation(
                                      defaults.findBabelConfig
                                    )}.
      --printer PRINTER             Specify which printer to use${optionAnnotation(
        defaults.printer
      )}.
  -s, --stdio                       Read source from stdin and print to stdout${optionAnnotation(
    defaults.stdio
  )}.
  -d, --dry                         Run plugins without modifying files on disk${optionAnnotation(
    defaults.dry
  )}.
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

  # Transform TypeScript sources.
  # ${$0} -p ./a.js my-typescript-file.ts a-component.tsx

  # Run with a plugin in \`node_modules\` on stdin.
  $ ${$0} -s -p babel-plugin-typecheck <<EOS
  function add(a: number, b: number): number {
    return a + b;
  }
  EOS

  # Reprint modified files with prettier.
  $ ${$0} --printer prettier -p some-plugin src/

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

function printVersion(argv: Array<string>, out: NodeJS.WritableStream): void {
  out.write(require('../package.json').version);
  out.write('\n');
}

export default async function run(
  argv: Array<string>,
  sys: System = RealSystem
): Promise<number> {
  let command: Command;

  try {
    command = new Options(argv.slice(2)).parse();
  } catch (error) {
    sys.stderr.write(`ERROR: ${error.message}\n`);
    printHelp(argv, sys.stderr);
    return 1;
  }

  if (command.kind === 'help') {
    printHelp(argv, sys.stdout);
    return 0;
  }

  if (command.kind === 'version') {
    printVersion(argv, sys.stdout);
    return 0;
  }

  const config = command.config;
  const dim = sys.stdout.isTTY ? '\x1b[2m' : '';
  const reset = sys.stdout.isTTY ? '\x1b[0m' : '';

  function onTransform(result: SourceTransformResult): void {
    if (result.kind === SourceTransformResultKind.Transformed) {
      if (!config.stdio) {
        if (result.output === result.source.content) {
          sys.stdout.write(`${dim}${result.source.path}${reset}\n`);
        } else {
          sys.stdout.write(`${result.source.path}\n`);
        }
      }
    } else if (result.error) {
      if (!config.stdio) {
        sys.stderr.write(
          `Encountered an error while processing ${result.source.path}:\n`
        );
      }

      sys.stderr.write(`${result.error.stack}\n`);
    }
  }

  const { stats } = await new CLIEngine(config, onTransform, sys).run();

  if (!config.stdio) {
    if (config.dry) {
      sys.stdout.write('DRY RUN: no files affected\n');
    }

    sys.stdout.write(
      `${stats.total} file(s), ${stats.modified} modified, ${stats.errors} errors\n`
    );
  }

  // exit status is number of errors up to byte max value
  return Math.min(stats.errors, 255);
}
