import * as Babel from '@babel/core';
import { ParserPlugin } from '@babel/parser';
import { extname } from 'path';
import { BabelPlugin, PluginObj } from './BabelPluginTypes';
import { TypeScriptExtensions } from './extensions';

const BASIC_PLUGINS: Array<ParserPlugin> = [
  'jsx',
  'asyncGenerators',
  'classProperties',
  'doExpressions',
  'functionBind',
  'functionSent',
  'objectRestSpread',
  'dynamicImport',
  ['decorators', { decoratorsBeforeExport: true }]
];

function pluginsForFilename(filename: string): Array<ParserPlugin> {
  const isTypeScript = TypeScriptExtensions.has(extname(filename));

  return isTypeScript
    ? [...BASIC_PLUGINS, 'typescript']
    : [...BASIC_PLUGINS, 'flow'];
}

// TODO: remove this hack once `allowUndeclaredExports` is included in typings
// https://github.com/babel/babel/pull/10263
interface ParserOptionsWithAllowUndeclaredExports extends Babel.ParserOptions {
  allowUndeclaredExports?: boolean;
}

export default function buildPlugin(
  sourceType: Babel.ParserOptions['sourceType']
): BabelPlugin {
  return function(): PluginObj {
    return {
      manipulateOptions(
        opts: Babel.TransformOptions,
        parserOpts: ParserOptionsWithAllowUndeclaredExports
      ): void {
        parserOpts.sourceType = sourceType;
        parserOpts.allowImportExportEverywhere = true;
        parserOpts.allowReturnOutsideFunction = true;
        parserOpts.allowSuperOutsideMethod = true;
        parserOpts.allowUndeclaredExports = true;
        parserOpts.plugins = [
          ...(parserOpts.plugins || []),
          ...pluginsForFilename(opts.filename as string)
        ];
      }
    };
  };
}
