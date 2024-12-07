import type { File } from '@babel/types'
import type { ParserOptions } from '@codemod-esm/parser'
import type { PluginObj } from './BabelPluginTypes'
import recast from 'recast'

export function parse(
  code: string,
  options: ParserOptions,
  parse: (code: string, options: ParserOptions) => File,
): File {
  return recast.parse(code, {
    parser: {
      parse(code: string) {
        return parse(code, { ...options, tokens: true })
      },
    },
  }) as File
  // Type guarded by parser.parse
}

export function generate(ast: File): { code: string, map?: object } {
  return recast.print(ast, { sourceMapName: 'map.json' })
}

export default function (): PluginObj {
  return {
    parserOverride: parse,
    generatorOverride: generate,
  }
}
