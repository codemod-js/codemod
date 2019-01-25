import * as Babel from '@babel/core';
import { ParserPlugin } from '@babel/parser';
import { extname } from 'path';
import { BabelPlugin, PluginObj } from './BabelPluginTypes';
import { TypeScriptExtensions } from './extensions';

const BASIC_PLUGINS: Array<ParserPlugin | [ParserPlugin, object]> = [
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

function pluginsForFilename(
  filename: string
): Array<ParserPlugin | [ParserPlugin, object]> {
  let isTypeScript = TypeScriptExtensions.has(extname(filename));

  return isTypeScript
    ? [...BASIC_PLUGINS, 'typescript']
    : [...BASIC_PLUGINS, 'flow'];
}

export default function buildPlugin(
  sourceType: Babel.ParserOptions['sourceType']
): BabelPlugin {
  return function(): PluginObj {
    return {
      manipulateOptions(
        opts: Babel.TransformOptions,
        parserOpts: Babel.ParserOptions
      ): void {
        parserOpts.sourceType = sourceType;
        parserOpts.allowImportExportEverywhere = true;
        parserOpts.allowReturnOutsideFunction = true;
        parserOpts.allowSuperOutsideMethod = true;
        // Cast this because @babel/types typings don't allow plugin options.
        parserOpts.plugins = [
          ...(parserOpts.plugins || []),
          ...pluginsForFilename(opts.filename as string)
        ] as Array<ParserPlugin>;
      }
    };
  };
}
