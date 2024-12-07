import type * as Babel from '@babel/core'
import type { File } from '@babel/types'
import type { ParserOptions } from '@codemod-esm/parser'

/**
 * Fixes the `PluginObj` type from `@babel/core` by making all fields optional
 * and adding parser and generator override methods.
 */
export interface PluginObj<S = File> extends Partial<Babel.PluginObj<S>> {
  parserOverride?: (
    code: string,
    options: ParserOptions,
    parse: (code: string, options: ParserOptions) => File,
  ) => File

  generatorOverride?: (
    ast: File,
    options: Babel.GeneratorOptions,
    code: string,
    generate: (ast: File, options: Babel.GeneratorOptions) => string,
  ) => { code: string, map?: object }
}

export type RawBabelPlugin = (babel: typeof Babel) => PluginObj
export type RawBabelPluginWithOptions = [RawBabelPlugin, object]
export type BabelPlugin = RawBabelPlugin | RawBabelPluginWithOptions
