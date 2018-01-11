import * as Babel from 'babel-core';
import { transform } from 'babel-core';
import { Visitor } from 'babel-traverse';
import * as babylon from 'babylon';
import { parse, print } from 'recast';

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

export type RawBabelPlugin = (
  babel: typeof Babel
) => { name?: string; visitor: Visitor };
export type RawBabelPluginWithOptions = [RawBabelPlugin, object];
export type BabelPlugin = RawBabelPlugin | RawBabelPluginWithOptions;

export default class TransformRunner {
  constructor(
    readonly sources: IterableIterator<Source> | Array<Source>,
    readonly plugins: Array<BabelPlugin>
  ) {}

  *run(): IterableIterator<SourceTransformResult> {
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
      parserOpts: {
        parser(code: string) {
          return parse(code, {
            parser: {
              parse(code: string) {
                return babylon.parse(code, {
                  sourceType: 'module',
                  allowImportExportEverywhere: false, // consistent with espree
                  allowReturnOutsideFunction: true,
                  allowSuperOutsideMethod: true,
                  plugins: [
                    'flow',
                    'jsx',
                    'asyncGenerators',
                    'classProperties',
                    'doExpressions',
                    'exportExtensions',
                    'functionBind',
                    'functionSent',
                    'objectRestSpread',
                    'dynamicImport',
                    'decorators'
                  ]
                });
              }
            }
          });
        }
      },
      generatorOpts: {
        generator: print
      },
      plugins: this.plugins
    } as {}).code as string;
  }
}
