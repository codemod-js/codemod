import { buildOptions, ParserOptions } from '@codemod/parser';
import { BabelPlugin, PluginObj } from './BabelPluginTypes';
import { TransformOptions } from '.';

export default function buildPlugin(
  sourceType: ParserOptions['sourceType']
): BabelPlugin {
  return function(): PluginObj {
    return {
      manipulateOptions(
        opts: TransformOptions,
        parserOpts: ParserOptions
      ): void {
        const options = buildOptions({
          ...parserOpts,
          sourceFileName:
            parserOpts.sourceFileName || opts.filename || undefined,
          sourceType
        });

        Object.assign(parserOpts, options);
      }
    };
  };
}
