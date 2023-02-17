import { join } from 'path'
import { inspect } from 'util'
import { Config, ConfigBuilder } from '../../src/Config'

// TODO: move some of the babel plugin loading tests in here

test('has sensible defaults', function () {
  const config = new Config()
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

test('associates plugin options based on declared name', async function () {
  const config = new ConfigBuilder()
    .addLocalPlugin(join(__dirname, '../fixtures/plugin/index.js'))
    .setOptionsForPlugin({ a: true }, 'basic-plugin')
    .build()

  // "basic-plugin" is declared in the plugin file
  const babelPlugin = await config.getBabelPlugin('basic-plugin')

  if (!Array.isArray(babelPlugin)) {
    throw new Error(
      `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
    )
  }

  expect(babelPlugin[1]).toEqual({ a: true })
})
