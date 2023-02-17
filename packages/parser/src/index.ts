import {
  parse as babelParse,
  ParserOptions as BabelParserOptions,
} from '@babel/parser'
import { File } from '@babel/types'
import {
  buildOptions,
  isParserPluginName,
  ParserOptions,
  ParserPluginName,
} from './options'

export { buildOptions, isParserPluginName, ParserOptions, ParserPluginName }

/**
 * Wraps `parse` from `@babel/parser`, but sets default options such that as few
 * restrictions as possible are placed on the `input` code.
 */
export function parse(input: string, options?: ParserOptions): File {
  return babelParse(input, buildOptions(options) as BabelParserOptions)
}
