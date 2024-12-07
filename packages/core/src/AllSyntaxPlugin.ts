import type { TransformOptions } from '.'
import type { BabelPlugin, PluginObj } from './BabelPluginTypes'
import { buildOptions, type ParserOptions } from '@codemod-esm/parser'

export function buildPlugin(
  sourceType: ParserOptions['sourceType'],
): BabelPlugin {
  return function (): PluginObj {
    return {
      manipulateOptions(
        _opts: TransformOptions,
        parserOpts: ParserOptions,
      ): void {
        const options = buildOptions({
          ...parserOpts,
          sourceType,
          plugins: parserOpts.plugins,
        })

        Object.assign(parserOpts, options)
      },
    }
  }
}
