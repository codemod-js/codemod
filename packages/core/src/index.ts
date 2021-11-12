import {
  TransformOptions as BabelTransformOptions,
  BabelFileResult,
  transformSync,
} from '@babel/core'
import RecastPlugin from './RecastPlugin'
import buildAllSyntaxPlugin from './AllSyntaxPlugin'
import { strict as assert } from 'assert'

export type TransformOptions = BabelTransformOptions

/**
 * Transform `code` using `@babel/core` parsing using Recast. Additionally,
 * `@codemod/parser` is used to enable as many parser plugins as possible.
 */
export function transform(
  code: string,
  options: TransformOptions = {}
): BabelFileResult {
  const result = transformSync(code, {
    ...options,
    plugins: [
      ...(options.plugins || []),
      buildAllSyntaxPlugin(options.sourceType || 'unambiguous'),
      RecastPlugin,
    ],
  })
  assert(result, 'transformSync must return a result')
  return result
}
