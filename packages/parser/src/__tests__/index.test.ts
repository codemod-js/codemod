import * as t from '@babel/types'
import { buildOptions, parse } from '..'

it('defaults `sourceType` to "unambiguous"', () => {
  expect(buildOptions().sourceType).toBe('unambiguous')
})

it('defaults `allowAwaitOutsideFunction` to true', () => {
  expect(buildOptions().allowAwaitOutsideFunction).toBe(true)
})

it('defaults `allowImportExportEverywhere` to true', () => {
  expect(buildOptions().allowImportExportEverywhere).toBe(true)
})

it('defaults `allowReturnOutsideFunction` to true', () => {
  expect(buildOptions().allowReturnOutsideFunction).toBe(true)
})

it('defaults `allowSuperOutsideMethod` to true', () => {
  expect(buildOptions().allowSuperOutsideMethod).toBe(true)
})

it('defaults `allowUndeclaredExports` to true', () => {
  expect(buildOptions().allowUndeclaredExports).toBe(true)
})

it('includes various plugins by default', () => {
  expect(buildOptions().plugins).toBeInstanceOf(Array)
})

it('includes "typescript" plugin when `sourceFilename` is not present', () => {
  expect(buildOptions().plugins).toContain('typescript')
})

it('includes "flow" plugin when `sourceFilename` is not TypeScript', () => {
  expect(buildOptions({ sourceFilename: 'index.js' }).plugins).toContain('flow')
  expect(buildOptions({ sourceFilename: 'index.jsx' }).plugins).toContain(
    'flow',
  )
})

it('includes "typescript" plugin when `sourceFilename` is TypeScript', () => {
  expect(buildOptions({ sourceFilename: 'index.ts' }).plugins).toContain(
    'typescript',
  )
  expect(buildOptions({ sourceFilename: 'index.tsx' }).plugins).toContain(
    'typescript',
  )
})

it('does not include "typescript" plugin when "flow" is already enabled', () => {
  expect(
    buildOptions({ plugins: [['flow', { all: true }]] }).plugins,
  ).not.toContain('typescript')
})

it('does not mix conflicting "recordAndTuple" and "pipelineOperator" plugins', () => {
  // adding recordAndTuple to existing plugins
  expect(
    buildOptions({ plugins: [['pipelineOperator', { proposal: 'smart' }]] })
      .plugins,
  ).not.toContainEqual(['recordAndTuple', expect.anything()])
  expect(
    buildOptions({
      plugins: [['pipelineOperator', { proposal: 'hack', topicToken: '#' }]],
    }).plugins,
  ).not.toContainEqual(['recordAndTuple', expect.anything()])
  expect(
    buildOptions({
      plugins: [['pipelineOperator', { proposal: 'hack', topicToken: '%' }]],
    }).plugins,
  ).toContainEqual(['recordAndTuple', { syntaxType: 'hash' }])

  // adding pipelineOperator to existing plugins
  expect(
    buildOptions({ plugins: [['recordAndTuple', { syntaxType: 'hash' }]] })
      .plugins,
  ).toContainEqual(['pipelineOperator', { proposal: 'minimal' }])
})

it('does not mutate `plugins` array', () => {
  const plugins: Array<PluginConfig> = []
  buildOptions({ plugins })
  expect(plugins).toHaveLength(0)
})

it('does not mutate options', () => {
  const options = {}
  buildOptions(options)
  expect(options).toEqual({})
})

it('includes "decorators" plugin with options by default', () => {
  expect(buildOptions().plugins).toContainEqual([
    'decorators',
    { decoratorsBeforeExport: true },
  ])
})

it('does not include "decorators" plugin if "decorators-legacy" is already enabled', () => {
  expect(
    buildOptions({ plugins: ['decorators-legacy'] }).plugins,
  ).not.toContain('decorators')
})

it('enables `topLevelAwait` even if `allowAwaitOutsideFunction` is disabled', () => {
  const options = buildOptions({ allowAwaitOutsideFunction: false })
  expect(options.plugins).toContain('topLevelAwait')
  expect(
    (parse('await 0', options).program.body[0] as t.ExpressionStatement)
      .expression.type,
  ).toEqual('AwaitExpression')
})

it('parses with a very broad set of options', () => {
  expect(
    parse(`
      // demonstrate 'allowReturnOutsideFunction' option and 'throwExpressions' plugin
      return true || throw new Error(a ?? b);
      // demonstrate 'allowUndeclaredExports' option
      export { a };
      // demonstrate 'typescript' plugin
      type Foo = Extract<PropertyKey, string>;
      // demonstrate 'logicalAssignment' plugin
      a ||= b
      // demonstrate 'partialApplication' plugin
      a(?, b)
      // demonstrate 'recordAndTuple' plugin
      #[1, 2, #{a: 3}]
      // demonstrate 'pipelineOperator' plugin with proposal=minimal
      x |> y
  `).program.body.map(node =>
      t.isExpressionStatement(node) ? node.expression.type : node.type,
    ),
  ).toEqual([
    'ReturnStatement',
    'ExportNamedDeclaration',
    'TSTypeAliasDeclaration',
    'AssignmentExpression',
    'CallExpression',
    'TupleExpression',
    'BinaryExpression',
  ])
})

it('does not parse placeholders by default as they conflict with TypeScript', () => {
  const placeholderCode = `
    // demonstrate 'placeholders' plugin
    %%statement%%
  `

  expect(() => parse(placeholderCode)).toThrowError()
  const node = parse(placeholderCode, { plugins: ['placeholders'] }).program.body[0]
  expect(node.type).toBe('Placeholder')
})

it('allows parsing records and tuples with "bar" syntax', () => {
  const tuple = (
    parse(`[|1, 2, {|a: 1|}|]`, {
      plugins: [['recordAndTuple', { syntaxType: 'bar' }]],
    }).program.body[0] as t.ExpressionStatement
  ).expression
  expect(t.isTupleExpression(tuple)).toBe(true)
  expect(t.isRecordExpression((tuple as t.TupleExpression).elements[2])).toBe(
    true,
  )
})

it('allows parsing of abstract classes with abstract methods', () => {
  expect(
    parse(`
      abstract class Foo {
        abstract bar(): void;
      }
    `).program.body[0].type,
  ).toBe('ClassDeclaration')
})
