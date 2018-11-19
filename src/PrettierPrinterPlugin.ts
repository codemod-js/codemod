import * as Babel from '@babel/core';
import { GeneratorOptions } from '@babel/generator';
import { File } from '@babel/types';
import * as Prettier from 'prettier';
import { sync as resolveSync } from 'resolve';
import { generate, parse } from './RecastPlugin';

function loadPrettier(): typeof Prettier {
  try {
    return require(resolveSync('prettier', { basedir: process.cwd() }));
  } catch {
    return require('prettier');
  }
}

export default function(babel: typeof Babel) {
  let prettier = loadPrettier();

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
      options: GeneratorOptions,
      code: string,
      _generate: (ast: File, options: GeneratorOptions) => string
    ): { code: string; map?: object } {
      return {
        code: prettier.format(
          generate(ast, options, code, _generate).code,
          resolvePrettierConfig(options.filename as string)
        )
      };
    }
  };
}
