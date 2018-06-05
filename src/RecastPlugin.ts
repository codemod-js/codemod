import * as Babel from '@babel/core';
import { GeneratorOptions } from '@babel/generator';
import * as recast from 'recast';
import { ALL_PLUGINS } from './AllSyntaxPlugin';
import { AST, ParseOptions } from './BabelPluginTypes';

const DEFAULT_OPTIONS = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  plugins: ALL_PLUGINS
};

export function parse(
  code: string,
  options: ParseOptions,
  parse: (code: string, options: ParseOptions) => AST
): AST {
  return recast.parse(code, {
    parser: {
      parse(code: string) {
        return parse(code, DEFAULT_OPTIONS);
      }
    }
  });
}

export function generate(
  ast: AST,
  options: GeneratorOptions,
  code: string,
  generate: (ast: AST, options: GeneratorOptions) => string
): { code: string; map?: object } {
  return recast.print(ast);
}

export default function(babel: typeof Babel) {
  return {
    parserOverride: parse,
    generatorOverride: generate
  };
}
