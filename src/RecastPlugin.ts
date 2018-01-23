import { GeneratorOptions } from '@babel/generator';
import * as recast from 'recast';

const DEFAULT_OPTIONS = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
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
};

type ParseOptions = object;
type AST = object;

export default {
  parserOverride(
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
  },

  generatorOverride(
    ast: AST,
    options: GeneratorOptions,
    code: string,
    generate: (ast: AST, options: GeneratorOptions) => string
  ): string {
    return recast.print(ast);
  }
};
