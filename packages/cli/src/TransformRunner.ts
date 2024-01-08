import type Transformer from './Transformer'

export class Source {
  constructor(
    readonly path: string,
    readonly content: string,
  ) {}
}

export enum SourceTransformResultKind {
  Transformed = 'Transformed',
  Error = 'Error',
}

export type SourceTransformResult =
  | {
      kind: SourceTransformResultKind.Transformed
      source: Source
      output: string
    }
  | { kind: SourceTransformResultKind.Error; source: Source; error: Error }

export class TransformRunner {
  constructor(
    readonly sources: AsyncGenerator<Source>,
    readonly transformer: Transformer,
  ) {}

  async *run(): AsyncIterableIterator<SourceTransformResult> {
    for await (const source of this.sources) {
      let result: SourceTransformResult

      try {
        const output = await this.transformer.transform(
          source.path,
          source.content,
        )
        result = {
          kind: SourceTransformResultKind.Transformed,
          source,
          output,
        }
      } catch (error) {
        // @ts-expect-error NodeJS Error
        result = { kind: SourceTransformResultKind.Error, source, error }
      }

      yield result
    }
  }
}
