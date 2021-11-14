import { deepEqual, ok, strictEqual } from 'assert'
import { join } from 'path'
import { inspect } from 'util'
import Config, { ConfigBuilder } from '../../src/Config'

// TODO: move some of the babel plugin loading tests in here

describe('Config', function () {
  it('has sensible defaults', function () {
    const config = new Config()
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

  it('associates plugin options based on declared name', async function () {
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

    deepEqual(babelPlugin[1], { a: true })
  })
})
