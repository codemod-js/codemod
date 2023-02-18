import { basename, relative } from 'path'
import { CLIEngine } from './CLIEngine'
import { Config } from './Config'
import { Options, Command } from './Options'
import {
  SourceTransformResult,
  SourceTransformResultKind,
} from './TransformRunner'
import * as matchers from '@codemod/matchers'

export * from './defineCodemod'
export { t, types } from '@codemod/utils'
export { matchers, matchers as m }

function optionAnnotation(
  value: boolean | Array<string> | Map<string, object> | string
): string {
  if (Array.isArray(value) || value instanceof Map) {
    return ' (allows multiple)'
  } else if (typeof value === 'boolean') {
    return ` (default: ${value ? 'on' : 'off'})`
  } else if (typeof value === 'string') {
    return ` (default: ${value})`
  } else {
    return ''
  }
}

function printHelp(argv: Array<string>, out: NodeJS.WritableStream): void {
  const $0 = basename(argv[1])
  const defaults = new Config()

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
  -o, --plugin-options OPTS         JSON-encoded OPTS for the last plugin provided${optionAnnotation(
    defaults.pluginOptions
  )}.
      --parser-plugins PLUGINS      Comma-separated PLUGINS to use with @babel/parser.
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

  # Pass options to a plugin.
  $ ${$0} -p ./a.js -o a='{"foo":true}' src/

  # Pass options from a config file to a plugin.
  $ ${$0} -p ./a.js -o a=@opts.json src/

  # Run with a plugin written in TypeScript.
  $ ${$0} -p ./some-plugin.ts src/
  `.trim()
  )
  out.write('\n')
}

function printVersion(argv: Array<string>, out: NodeJS.WritableStream): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  out.write(require('../package.json').version)
  out.write('\n')
}

export async function run(argv: Array<string>): Promise<number> {
  let command: Command

  try {
    command = new Options(argv.slice(2)).parse()
  } catch (error) {
    process.stderr.write(`ERROR: ${error.message}\n`)
    printHelp(argv, process.stderr)
    return 1
  }

  if (command.kind === 'help') {
    printHelp(argv, process.stdout)
    return 0
  }

  if (command.kind === 'version') {
    printVersion(argv, process.stdout)
    return 0
  }

  const config = command.config
  const dim = process.stdout.isTTY ? '\x1b[2m' : ''
  const reset = process.stdout.isTTY ? '\x1b[0m' : ''

  function onTransform(result: SourceTransformResult): void {
    const relativePath = relative(process.cwd(), result.source.path)
    if (result.kind === SourceTransformResultKind.Transformed) {
      if (!config.stdio) {
        if (result.output === result.source.content) {
          process.stdout.write(`${dim}${relativePath}${reset}\n`)
        } else {
          process.stdout.write(`${relativePath}\n`)
        }
      }
    } else if (result.error) {
      if (!config.stdio) {
        process.stderr.write(
          `Encountered an error while processing ${relativePath}:\n`
        )
      }

      process.stderr.write(`${result.error.stack}\n`)
    }
  }

  const { stats } = await new CLIEngine(config, onTransform).run()

  if (!config.stdio) {
    if (config.dry) {
      process.stdout.write('DRY RUN: no files affected\n')
    }

    process.stdout.write(
      `${stats.total} file(s), ${stats.modified} modified, ${stats.errors} errors\n`
    )
  }

  // exit status is number of errors up to byte max value
  return Math.min(stats.errors, 255)
}

export default run
