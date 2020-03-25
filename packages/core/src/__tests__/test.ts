import { transform, Printer } from '..'
import { NodePath, PluginItem } from '@babel/core'
import * as t from '@babel/types'

const incrementNumbersPlugin: PluginItem = {
  visitor: {
    NumericLiteral(path: NodePath<t.NumericLiteral>) {
      path.node.value += 1
    },
  },
}

test('prints with recast by default', () => {
  expect(transform('var a=1;').code).toBe('var a=1;')
})

test('allows printing with babel', () => {
  expect(transform('var a=1;', { printer: Printer.Babel }).code).toBe(
    'var a = 1;'
  )
})

test('allows printing with prettier', () => {
  expect(
    transform('var a=1;', { filename: 'index.js', printer: Printer.Prettier })
      .code
  ).toBe('var a = 1\n')
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
