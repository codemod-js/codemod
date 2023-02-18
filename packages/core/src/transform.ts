import {
  BabelFileResult,
  TransformOptions as BabelTransformOptions,
  transformSync,
} from '@babel/core'
import { strict as assert } from 'assert'
import { buildPlugin } from './AllSyntaxPlugin'
import RecastPlugin from './RecastPlugin'

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
      buildPlugin(options.sourceType || 'unambiguous'),
      RecastPlugin,
    ],
  })
  assert(result, 'transformSync must return a result')
  return result
}
