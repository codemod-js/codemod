import { deepEqual } from 'assert'
import TransformRunner, {
  Source,
  SourceTransformResult,
  SourceTransformResultKind,
} from '../../src/TransformRunner'

async function run(
  runner: TransformRunner
): Promise<Array<SourceTransformResult>> {
  const result: Array<SourceTransformResult> = []

  for await (const transformResult of runner.run()) {
    result.push(transformResult)
  }

  return result
}

async function* asyncIterable<T>(elements: Iterable<T>): AsyncGenerator<T> {
  for (const element of elements) {
    yield element
  }
}

test('generates a result for each source by calling the transformer', async function () {
  const aSource = new Source('a.js', 'a;')
  const bSource = new Source('b.js', 'b;')
  const sources = asyncIterable([aSource, bSource])
  const runner = new TransformRunner(sources, {
    async transform(filepath: string, content: string): Promise<string> {
      return content.toUpperCase()
    },
  })

  deepEqual(await run(runner), [
    {
      kind: SourceTransformResultKind.Transformed,
      source: aSource,
      output: 'A;',
    },
    {
      kind: SourceTransformResultKind.Transformed,
      source: bSource,
      output: 'B;',
    },
  ])
})

test('collects errors for each failed source transform', async function () {
  const source = new Source('fails.js', 'invalid syntax')
  const sources = asyncIterable([source])
  const runner = new TransformRunner(sources, {
    async transform(filepath: string, content: string): Promise<string> {
      throw new Error(`unable to process ${filepath}: ${content}`)
    },
  })

  deepEqual(await run(runner), [
    {
      kind: SourceTransformResultKind.Error,
      source,
      error: new Error('unable to process fails.js: invalid syntax'),
    },
  ])
})
