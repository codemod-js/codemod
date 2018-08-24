import * as Babel from '@babel/core';
import { extname } from 'path';
import { BabelOptions, ParseOptions } from './BabelPluginTypes';
import { TypeScriptExtensions } from './extensions';

const BASIC_PLUGINS: Array<string | [string, object]> = [
  'jsx',
  'asyncGenerators',
  'classProperties',
  'doExpressions',
  'exportExtensions',
  'functionBind',
  'functionSent',
  'objectRestSpread',
  'dynamicImport',
  ['decorators', { decoratorsBeforeExport: true }]
];

function pluginsForFilename(
  filename: string
): Array<string | [string, object]> {
  let isTypeScript = TypeScriptExtensions.has(extname(filename));

  return isTypeScript
    ? [...BASIC_PLUGINS, 'typescript']
    : [...BASIC_PLUGINS, 'flow'];
}

export default function(babel: typeof Babel) {
  return {
    manipulateOptions(opts: BabelOptions, parserOpts: ParseOptions) {
      parserOpts.sourceType = 'module';
      parserOpts.allowImportExportEverywhere = true;
      parserOpts.allowReturnOutsideFunction = true;
      parserOpts.allowSuperOutsideMethod = true;
      parserOpts.plugins = [
        ...(parserOpts.plugins || []),
        ...pluginsForFilename(opts.filename)
      ];
    }
  };
}
