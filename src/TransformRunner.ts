import { parse, print } from 'recast';
import * as Babel from 'babel-core';
import { transform } from 'babel-core';
import { Visitor } from 'babel-traverse';
import * as babylon from 'babylon';
import { BabylonOptions } from 'babylon';

export class Source {
  constructor(
    readonly path: string,
    readonly content: string,
  ) {}
}

export class SourceTransformResult {
  constructor(
    readonly source: Source,
    readonly output: string | null,
    readonly error: Error | null,
  ) {}
}

export type Plugin = (babel: typeof Babel) => { visitor: Visitor };

export type TransformRunnerDelegate = {
  transformStart?: (runner: TransformRunner) => void;
  transformEnd?: (runner: TransformRunner) => void;
  transformSourceStart?: (runner: TransformRunner, source: Source) => void;
  transformSourceEnd?: (runner: TransformRunner, transformed: SourceTransformResult) => void;
};

export default class TransformRunner {
  constructor(
    readonly sources: IterableIterator<Source>,
    readonly plugins: Array<Plugin>,
    private readonly delegate: TransformRunnerDelegate = {},
  ) {}

  run(): Array<SourceTransformResult> {
    let result: Array<SourceTransformResult> = [];

    if (this.delegate.transformStart) {
      this.delegate.transformStart(this);
    }

    for (let source of this.sources) {
      if (this.delegate.transformSourceStart) {
        this.delegate.transformSourceStart(this, source);
      }

      let transformed: SourceTransformResult;

      try {
        let output = this.transformSource(source);
        transformed = new SourceTransformResult(source, output, null);
      } catch (err) {
        transformed = new SourceTransformResult(source, null, err);
      }

      result.push(transformed);

      if (this.delegate.transformSourceEnd) {
        this.delegate.transformSourceEnd(this, transformed);
      }
    }

    if (this.delegate && this.delegate.transformEnd) {
      this.delegate.transformEnd(this);
    }

    return result;
  }

  private transformSource(source: Source): string {
    return transform(source.content, {
      parserOpts: {
        parser(code: string) {
          return parse(
            code, {
              parser: {
                parse(code) {
                  return babylon.parse(code, {
                    sourceType: 'module',
                    allowImportExportEverywhere: false, // consistent with espree
                    allowReturnOutsideFunction: true,
                    allowSuperOutsideMethod: true,
                    plugins: [
                      "flow",
                      "jsx",
                      "asyncGenerators",
                      "classProperties",
                      "doExpressions",
                      "exportExtensions",
                      "functionBind",
                      "functionSent",
                      "objectRestSpread",
                      "dynamicImport"
                    ]
                  });
                }
              }
            }
          );
        }
      },
      generatorOpts: {
        generator: print
      },
      plugins: this.plugins
    }).code as string;
  }
}
