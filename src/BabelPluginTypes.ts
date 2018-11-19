import * as Babel from '@babel/core';
import { GeneratorOptions } from '@babel/generator';
import { Visitor } from '@babel/traverse';

export interface BabelOptions {
  filename: string;
}
export interface ParseOptions {
  sourceType?: 'module' | 'script';
  allowImportExportEverywhere?: boolean;
  allowReturnOutsideFunction?: boolean;
  allowSuperOutsideMethod?: boolean;
  plugins?: Array<string | [string, object]>;
  tokens?: boolean;
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
