import { deepEqual, ok, strictEqual, throws } from 'assert'
import { inspect } from 'util'
import Config from '../../src/Config'
import Options, { Command } from '../../src/Options'

describe('Options', function () {
  it('has sensible defaults', function () {
    const config = getRunConfig(new Options([]).parse())
    ok(config.extensions.has('.js'))
    ok(config.extensions.has('.ts'))
    ok(config.extensions.has('.jsx'))
    ok(config.extensions.has('.tsx'))
    deepEqual(config.localPlugins, [])
    deepEqual(config.sourcePaths, [])
    deepEqual(config.requires, [])
    strictEqual(config.pluginOptions.size, 0)
    strictEqual(config.stdio, false)
  })

  it('interprets `--help` as asking for help', function () {
    strictEqual(new Options(['--help']).parse().kind, 'help')
  })

  it('interprets `--version` as asking to print the version', function () {
    strictEqual(new Options(['--version']).parse().kind, 'version')
  })

  it('interprets `--extensions` as expected', function () {
    const config = getRunConfig(
      new Options(['--extensions', '.js,.ts']).parse()
    )
    deepEqual(config.extensions, new Set(['.js', '.ts']))
  })

  it('--add-extension adds to the default extensions', function () {
    const config = getRunConfig(
      new Options(['--add-extension', '.myjs']).parse()
    )
    ok(config.extensions.size > 1)
    ok(config.extensions.has('.myjs'))
  })

  it('fails to parse unknown options', function () {
    throws(
      () => new Options(['--wtf']).parse(),
      Error,
      'unexpected option: --wtf'
    )
  })

  it('interprets non-option arguments as paths', function () {
    const config = getRunConfig(new Options(['src/', 'a.js']).parse())
    deepEqual(config.sourcePaths, ['src/', 'a.js'])
  })

  it('interprets `--stdio` as reading/writing stdin/stdout', function () {
    const config = getRunConfig(new Options(['--stdio']).parse())
    strictEqual(config.stdio, true)
  })

  it('can parse inline plugin options as JSON', function () {
    const config = getRunConfig(
      new Options(['-o', 'my-plugin={"foo": true}']).parse()
    )
    deepEqual(config.pluginOptions.get('my-plugin'), { foo: true })
  })

  it('associates plugin options based on declared name', async function () {
    const config = getRunConfig(
      new Options([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'basic-plugin={"a": true}',
      ]).parse()
    )

    deepEqual(config.pluginOptions.get('basic-plugin'), { a: true })
  })

  it('assigns anonymous options to the most recent plugin', async function () {
    const config = getRunConfig(
      new Options([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        '{"a": true}',
      ]).parse()
    )

    deepEqual(config.pluginOptions.get('./test/fixtures/plugin/index.js'), {
      a: true,
    })
  })

  it('interprets `--require` as expected', function () {
    const config = getRunConfig(new Options(['--require', 'tmp']).parse())
    deepEqual(
      config.requires,
      ['tmp'].map((name) => require.resolve(name))
    )
  })

  it('associates plugin options based on inferred name', async function () {
    const config = getRunConfig(
      new Options([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'index={"a": true}',
      ]).parse()
    )

    // "index" is the name of the file
    deepEqual(config.pluginOptions.get('index'), { a: true })

    const babelPlugin = await config.getBabelPlugin('index')

    if (!Array.isArray(babelPlugin)) {
      throw new Error(
        `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
      )
    }

    deepEqual(babelPlugin[1], { a: true })
  })

  it('can parse a JSON file for plugin options', function () {
    // You wouldn't actually use package.json, but it's a convenient JSON file.
    const config = getRunConfig(
      new Options(['-o', 'my-plugin=@package.json']).parse()
    )
    const pluginOpts = config.pluginOptions.get('my-plugin')
    strictEqual(pluginOpts && pluginOpts['name'], '@codemod/cli')
  })

  it('should set dry option', function () {
    const config = getRunConfig(new Options(['--dry']).parse())
    strictEqual(config.dry, true)
  })

  function getRunConfig(command: Command): Config {
    if (command.kind === 'run') {
      return command.config
    } else {
      throw new Error(`expected a run command but got: ${inspect(command)}`)
    }
  }
})
