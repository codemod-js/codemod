import { installAsyncIterator } from './polyfills';
import Transformer from './Transformer';

export class Source {
  constructor(readonly path: string, readonly content: string) {}
}

export class SourceTransformResult {
  constructor(
    readonly source: Source,
    readonly output: string | null,
    readonly error: Error | null
  ) {}
}

export default class TransformRunner {
  constructor(
    readonly sources: IterableIterator<Source> | Array<Source>,
    readonly transformer: Transformer
  ) {}

  async *run(): AsyncIterableIterator<SourceTransformResult> {
    installAsyncIterator();

    for (let source of this.sources) {
      let transformed: SourceTransformResult;

      try {
        await this.transformer.ready();
        let output = await this.transformer.transform(
          source.path,
          source.content
        );
        transformed = new SourceTransformResult(source, output, null);
      } catch (err) {
        transformed = new SourceTransformResult(source, null, err);
      }

      yield transformed;
    }

    await this.transformer.cleanup();
  }
}
