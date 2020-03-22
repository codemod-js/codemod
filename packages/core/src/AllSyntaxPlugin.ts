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
          sourceType
        });

        for (const key of Object.keys(options)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (parserOpts as any)[key] = (options as any)[key];
        }
      }
    };
  };
}
