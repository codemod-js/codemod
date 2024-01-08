import { buildOptions, type ParserOptions } from '@codemod/parser'
import { type TransformOptions } from '.'
import type { BabelPlugin, PluginObj } from './BabelPluginTypes'

export function buildPlugin(
  sourceType: ParserOptions['sourceType'],
): BabelPlugin {
  return function (): PluginObj {
    return {
      manipulateOptions(
        opts: TransformOptions,
        parserOpts: ParserOptions,
      ): void {
        const options = buildOptions({
          ...parserOpts,
          sourceType,
          plugins: parserOpts.plugins,
        })

        for (const key of Object.keys(options)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(parserOpts as any)[key] = (options as any)[key]
        }
      },
    }
  }
}
