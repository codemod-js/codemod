import { transform } from '..'
import { NodePath, PluginItem } from '@babel/core'
import * as t from '@babel/types'

const incrementNumbersPlugin: PluginItem = {
  visitor: {
    NumericLiteral(path: NodePath<t.NumericLiteral>) {
      path.node.value += 1
    },
  },
}

test('preserves formatting', () => {
  expect(transform('var a=1;').code).toBe('var a=1;')
})

test('transforms using a custom babel plugin', () => {
  expect(
    transform('var a=1', {
      plugins: [incrementNumbersPlugin],
    }).code
  ).toBe('var a=2')
})

test('parses with as many parser plugins as possible', () => {
  expect(() => transform('a ?? b').code).not.toThrow()
})
