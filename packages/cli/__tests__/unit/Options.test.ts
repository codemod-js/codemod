import { join } from 'path'
import { inspect } from 'util'
import { Config } from '../../src/Config'
import { Options, Command } from '../../src/Options'

test('has sensible defaults', function () {
  const config = getRunConfig(new Options([]).parse())
  expect(config.extensions).toContain('.js')
  expect(config.extensions).toContain('.ts')
  expect(config.extensions).toContain('.jsx')
  expect(config.extensions).toContain('.tsx')
  expect(config.localPlugins).toEqual([])
  expect(config.sourcePaths).toEqual([])
  expect(config.requires).toEqual([])
  expect(config.pluginOptions.size).toEqual(0)
  expect(config.stdio).toEqual(false)
})

test('interprets `--help` as asking for help', function () {
  expect(new Options(['--help']).parse().kind).toEqual('help')
})

test('interprets `--version` as asking to print the version', function () {
  expect(new Options(['--version']).parse().kind).toEqual('version')
})

test('interprets `--extensions` as expected', function () {
  const config = getRunConfig(new Options(['--extensions', '.js,.ts']).parse())
  expect(config.extensions).toEqual(new Set(['.js', '.ts']))
})

test('--add-extension adds to the default extensions', function () {
  const config = getRunConfig(new Options(['--add-extension', '.myjs']).parse())
  expect(config.extensions.size > 1).toBeTruthy()
  expect(config.extensions).toContain('.myjs')
})

test('fails to parse unknown options', function () {
  expect(() => new Options(['--wtf']).parse()).toThrow(
    new Error('unexpected option: --wtf')
  )
})

test('interprets non-option arguments as paths', function () {
  const config = getRunConfig(new Options(['src/', 'a.js']).parse())
  expect(config.sourcePaths).toEqual(['src/', 'a.js'])
})

test('interprets `--stdio` as reading/writing stdin/stdout', function () {
  const config = getRunConfig(new Options(['--stdio']).parse())
  expect(config.stdio).toEqual(true)
})

test('can parse inline plugin options as JSON', function () {
  const config = getRunConfig(
    new Options(['-o', 'my-plugin={"foo": true}']).parse()
  )
  expect(config.pluginOptions.get('my-plugin')).toEqual({ foo: true })
})

test('associates plugin options based on declared name', async function () {
  const config = getRunConfig(
    new Options([
      '--plugin',
      join(__dirname, '../fixtures/plugin/index.js'),
      '--plugin-options',
      'basic-plugin={"a": true}',
    ]).parse()
  )

  expect(config.pluginOptions.get('basic-plugin')).toEqual({ a: true })
})

test('assigns anonymous options to the most recent plugin', async function () {
  const config = getRunConfig(
    new Options([
      '--plugin',
      join(__dirname, '../fixtures/plugin/index.js'),
      '--plugin-options',
      '{"a": true}',
    ]).parse()
  )

  expect(
    config.pluginOptions.get(join(__dirname, '../fixtures/plugin/index.js'))
  ).toEqual({
    a: true,
  })
})

test('interprets `--require` as expected', function () {
  const config = getRunConfig(new Options(['--require', 'tmp']).parse())
  expect(config.requires).toEqual(['tmp'].map((name) => require.resolve(name)))
})

test('associates plugin options based on inferred name', async function () {
  const config = getRunConfig(
    new Options([
      '--plugin',
      join(__dirname, '../fixtures/plugin/index.js'),
      '--plugin-options',
      'index={"a": true}',
    ]).parse()
  )

  // "index" is the name of the file
  expect(config.pluginOptions.get('index')).toEqual({ a: true })

  const babelPlugin = await config.getBabelPlugin('index')

  if (!Array.isArray(babelPlugin)) {
    throw new Error(
      `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
    )
  }

  expect(babelPlugin[1]).toEqual({ a: true })
})

test('can parse a JSON file for plugin options', function () {
  // You wouldn't actually use package.json, but it's a convenient JSON file.
  const config = getRunConfig(
    new Options(['-o', 'my-plugin=@package.json']).parse()
  )
  const pluginOpts = config.pluginOptions.get('my-plugin')
  expect(pluginOpts && pluginOpts['name']).toEqual('@codemod/cli')
})

test('should set dry option', function () {
  const config = getRunConfig(new Options(['--dry']).parse())
  expect(config.dry).toEqual(true)
})

function getRunConfig(command: Command): Config {
  if (command.kind === 'run') {
    return command.config
  } else {
    throw new Error(`expected a run command but got: ${inspect(command)}`)
  }
}
