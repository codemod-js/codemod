import * as Babel from '@babel/core';
import { GeneratorOptions } from '@babel/generator';
import * as Prettier from 'prettier';
import { sync as resolveSync } from 'resolve';
import { generate, parse } from './RecastPlugin';
import { AST } from './TransformRunner';

function loadPrettier(): typeof Prettier {
  try {
    return require(resolveSync('prettier', { basedir: process.cwd() }));
  } catch {
    return require('prettier');
  }
}

export default function(babel: typeof Babel) {
  let prettier = loadPrettier();

  return {
    parserOverride: parse,
    generatorOverride(
      ast: AST,
      options: GeneratorOptions,
      code: string,
      _generate: (ast: AST, options: GeneratorOptions) => string
    ): { code: string; map?: object } {
      return {
        code: prettier.format(
          generate(ast, options, code, _generate).code,
          prettier.resolveConfig.sync(options.filename) || undefined
        )
      };
    }
  };
}
