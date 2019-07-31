import { GeneratorOptions } from '@babel/generator';
import { File } from '@babel/types';
import * as Prettier from 'prettier';
import { sync as resolveSync } from 'resolve';
import { generate, parse } from './RecastPlugin';
import { PluginObj } from './BabelPluginTypes';

function loadPrettier(): typeof Prettier {
  try {
    return require(resolveSync('prettier', { basedir: process.cwd() }));
  } catch {
    return require('prettier');
  }
}

export default function(): PluginObj {
  const prettier = loadPrettier();

  function resolvePrettierConfig(filepath: string): Prettier.Options {
    return {
      ...(prettier.resolveConfig.sync(filepath) || undefined),
      filepath
    };
  }

  return {
    parserOverride: parse,
    generatorOverride(
      ast: File,
      options: GeneratorOptions
    ): { code: string; map?: object } {
      return {
        code: prettier.format(
          generate(ast).code,
          resolvePrettierConfig(options.filename as string)
        )
      };
    }
  };
}
