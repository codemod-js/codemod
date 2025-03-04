import type { ParserOptions as BabelParserOptions } from '@babel/parser'
import type { File } from '@babel/types'
import type { ParserOptions, ParserPluginName } from './options'
import {
  parse as babelParse,

} from '@babel/parser'
import {
  buildOptions,
  isParserPluginName,

} from './options'

export {
  buildOptions,
  isParserPluginName,
  type ParserOptions,
  type ParserPluginName,
}

/**
 * Wraps `parse` from `@babel/parser`, but sets default options such that as few
 * restrictions as possible are placed on the `input` code.
 */
export function parse(input: string, options?: ParserOptions): File {
  return babelParse(input, buildOptions(options) as BabelParserOptions)
}
