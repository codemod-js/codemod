import { NodePath } from '@babel/traverse'
import { NumericLiteral, Program } from '@babel/types'
import { join } from 'path'
import InlineTransformer from '../../src/InlineTransformer'
import { PluginItem } from '@babel/core'

test('passes source through as-is when there are no plugins', async function () {
  const filepath = 'a.js'
  const content = 'a + b;'
  const transformer = new InlineTransformer([])
  const output = await transformer.transform(filepath, content)

  expect(output).toEqual(content)
})

test('transforms source using plugins', async function () {
  const filepath = 'a.js'
  const content = '3 + 4;'
  const transformer = new InlineTransformer([
    (): PluginItem => ({
      visitor: {
        NumericLiteral(path: NodePath<NumericLiteral>): void {
          path.node.value++
        },
      },
    }),
  ])
  const output = await transformer.transform(filepath, content)

  expect(output).toEqual('4 + 5;')
})

test('does not include any plugins not specified explicitly', async function () {
  const filepath = 'a.js'
  const content = 'export default 0;'
  const transformer = new InlineTransformer([])
  const output = await transformer.transform(filepath, content)

  expect(output).toEqual('export default 0;')
})

test('allows running plugins with options', async function () {
  const filepath = 'a.js'
  const content = '3 + 4;'
  const transformer = new InlineTransformer([
    [
      (): PluginItem => ({
        visitor: {
          NumericLiteral(
            path: NodePath<NumericLiteral>,
            state: { opts: { value?: number } }
          ) {
            if (state.opts.value === path.node.value) {
              path.node.value++
            }
          },
        },
      }),
      { value: 3 },
    ],
  ])
  const output = await transformer.transform(filepath, content)

  expect(output).toEqual('4 + 4;')
})

test('passes the filename', async function () {
  const filepath = 'a.js'
  const content = ''
  let filename: string | undefined

  const transformer = new InlineTransformer([
    (): PluginItem => ({
      visitor: {
        Program(
          path: NodePath<Program>,
          state: {
            file: { opts: { filename: string } }
          }
        ) {
          filename = state.file.opts.filename
        },
      },
    }),
  ])

  // Ignore the result since we only care about arguments to the visitor.
  await transformer.transform(filepath, content)

  expect(filename).toEqual(join(process.cwd(), 'a.js'))
})
