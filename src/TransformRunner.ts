import * as Babel from '@babel/core';
import { transform } from '@babel/core';
import { GeneratorOptions } from '@babel/generator';
import { Visitor } from '@babel/traverse';

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

export interface BabelOptions {
  filename: string;
}
export interface ParseOptions {
  plugins: Array<string>;
}
export type AST = object;

export type RawBabelPlugin = (
  babel: typeof Babel
) => {
  name?: string;
  visitor?: Visitor;
  manipulateOptions?: (opts: object, parserOpts: ParseOptions) => void;
  parserOverride?: (
    code: string,
    options: ParseOptions,
    parse: (code: string, options: ParseOptions) => AST
  ) => AST;
  generatorOverride?: (
    ast: AST,
    options: GeneratorOptions,
    code: string,
    generate: (ast: AST, options: GeneratorOptions) => string
  ) => { code: string; map?: object };
};
export type RawBabelPluginWithOptions = [RawBabelPlugin, object];
export type BabelPlugin = RawBabelPlugin | RawBabelPluginWithOptions;

export default class TransformRunner {
  constructor(
    readonly sources: IterableIterator<Source> | Array<Source>,
    readonly plugins: Array<BabelPlugin>
  ) {}

  *run(): AsyncIterableIterator<SourceTransformResult> {
    for (let source of this.sources) {
      let transformed: SourceTransformResult;

      try {
        let output = this.transformSource(source);
        transformed = new SourceTransformResult(source, output, null);
      } catch (err) {
        transformed = new SourceTransformResult(source, null, err);
      }

      yield transformed;
    }
  }

  private transformSource(source: Source): string {
    return transform(source.content, {
      filename: source.path,
      babelrc: false,
      plugins: this.plugins
    } as {}).code as string;
  }
}
