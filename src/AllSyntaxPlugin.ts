import * as Babel from '@babel/core';
import { BabelOptions, ParseOptions } from './BabelPluginTypes';

export const ALL_PLUGINS = [
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
];

export default function(babel: typeof Babel) {
  return {
    manipulateOptions(opts: BabelOptions, parserOpts: ParseOptions) {
      for (let plugin of ALL_PLUGINS) {
        if (plugin !== 'flow' || !opts.filename.endsWith('.ts')) {
          parserOpts.plugins.push(plugin);
        }
      }
    }
  };
}
