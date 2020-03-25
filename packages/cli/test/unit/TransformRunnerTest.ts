import { deepEqual } from 'assert'
import TransformRunner, {
  Source,
  SourceTransformResult,
  SourceTransformResultKind,
} from '../../src/TransformRunner'

describe('TransformRunner', function () {
  async function run(
    runner: TransformRunner
  ): Promise<Array<SourceTransformResult>> {
    const result: Array<SourceTransformResult> = []

    for await (const transformResult of runner.run()) {
      result.push(transformResult)
    }

    return result
  }

  it('generates a result for each source by calling the transformer', async function () {
    const sources = [new Source('a.js', 'a;'), new Source('b.js', 'b;')]
    const runner = new TransformRunner(sources, {
      async transform(filepath: string, content: string): Promise<string> {
        return content.toUpperCase()
      },
    })

    deepEqual(await run(runner), [
      {
        kind: SourceTransformResultKind.Transformed,
        source: sources[0],
        output: 'A;',
      },
      {
        kind: SourceTransformResultKind.Transformed,
        source: sources[1],
        output: 'B;',
      },
    ])
  })

  it('collects errors for each failed source transform', async function () {
    const sources = [new Source('fails.js', 'invalid syntax')]
    const runner = new TransformRunner(sources, {
      async transform(filepath: string, content: string): Promise<string> {
        throw new Error(`unable to process ${filepath}: ${content}`)
      },
    })

    deepEqual(await run(runner), [
      {
        kind: SourceTransformResultKind.Error,
        source: sources[0],
        error: new Error('unable to process fails.js: invalid syntax'),
      },
    ])
  })
})
