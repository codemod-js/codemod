import { parse, buildOptions } from '..'
import * as t from '@babel/types'

test('defaults `sourceType` to "unambiguous"', () => {
  expect(buildOptions().sourceType).toBe('unambiguous')
})

test('defaults `allowAwaitOutsideFunction` to true', () => {
  expect(buildOptions().allowAwaitOutsideFunction).toBe(true)
})

test('defaults `allowImportExportEverywhere` to true', () => {
  expect(buildOptions().allowImportExportEverywhere).toBe(true)
})

test('defaults `allowReturnOutsideFunction` to true', () => {
  expect(buildOptions().allowReturnOutsideFunction).toBe(true)
})

test('defaults `allowSuperOutsideMethod` to true', () => {
  expect(buildOptions().allowSuperOutsideMethod).toBe(true)
})

test('defaults `allowUndeclaredExports` to true', () => {
  expect(buildOptions().allowUndeclaredExports).toBe(true)
})

test('includes various plugins by default', () => {
  expect(buildOptions().plugins).toBeInstanceOf(Array)
})

test('includes "typescript" plugin when `sourceFilename` is not present', () => {
  expect(buildOptions().plugins).toContain('typescript')
})

test('includes "flow" plugin when `sourceFilename` is not TypeScript', () => {
  expect(buildOptions({ sourceFilename: 'index.js' }).plugins).toContain('flow')
  expect(buildOptions({ sourceFilename: 'index.jsx' }).plugins).toContain(
    'flow'
  )
})

test('includes "typescript" plugin when `sourceFilename` is TypeScript', () => {
  expect(buildOptions({ sourceFilename: 'index.ts' }).plugins).toContain(
    'typescript'
  )
  expect(buildOptions({ sourceFilename: 'index.tsx' }).plugins).toContain(
    'typescript'
  )
})

test('does not include "typescript" plugin when "flow" is already enabled', () => {
  expect(
    buildOptions({ plugins: [['flow', { all: true }]] }).plugins
  ).not.toContain('typescript')
})

test('does not mutate `plugins` array', () => {
  const plugins = []
  buildOptions({ plugins })
  expect(plugins).toHaveLength(0)
})

test('does not mutate options', () => {
  const options = {}
  buildOptions(options)
  expect(options).toEqual({})
})

test('includes "decorators" plugin with options by default', () => {
  expect(buildOptions().plugins).toContainEqual([
    'decorators',
    { decoratorsBeforeExport: true },
  ])
})

test('does not include "decorators" plugin if "decorators-legacy" is already enabled', () => {
  expect(buildOptions({ plugins: ['decorators-legacy'] })).not.toContain(
    'decorators'
  )
})

test('enables `topLevelAwait` even if `allowAwaitOutsideFunction` is disabled', () => {
  const options = buildOptions({ allowAwaitOutsideFunction: false })
  expect(options.plugins).toContain('topLevelAwait')
  expect(
    (parse('await 0', options).program.body[0] as t.ExpressionStatement)
      .expression.type
  ).toEqual('AwaitExpression')
})

test('parses with a very broad set of options', () => {
  expect(
    parse(`
      // demonstrate 'allowReturnOutsideFunction' option and 'throwExpressions' plugin
      return true || throw new Error(a ?? b);
      // demonstrate 'allowUndeclaredExports' option
      export { a };
      // demonstrate 'typescript' plugin
      type Foo = Extract<PropertyKey, string>;
      // demonstrate 'placeholders' plugin
      %%statement%%
      // demonstrate 'logicalAssignment' plugin
      a ||= b
      // demonstrate 'partialApplication' plugin
      a(?, b)
      // demonstrate 'recordAndTuple' plugin
      #[1, 2, #{a: 3}]
  `).program.body.map((node) =>
      t.isExpressionStatement(node) ? node.expression.type : node.type
    )
  ).toEqual([
    'ReturnStatement',
    'ExportNamedDeclaration',
    'TSTypeAliasDeclaration',
    'Placeholder',
    'AssignmentExpression',
    'CallExpression',
    'TupleExpression',
  ])
})

test('allows parsing records and tuples with "bar" syntax', () => {
  const tuple = (
    parse(`[|1, 2, {|a: 1|}|]`, {
      plugins: [['recordAndTuple', { syntaxType: 'bar' }]],
    }).program.body[0] as t.ExpressionStatement
  ).expression
  expect(t.isTupleExpression(tuple)).toBe(true)
  expect(t.isRecordExpression((tuple as t.TupleExpression).elements[2])).toBe(
    true
  )
})
