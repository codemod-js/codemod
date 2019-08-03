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

const DEFAULT_PARSER = 'babel';

type PrettierParser = Prettier.Options['parser'];

export default function(): PluginObj {
  const prettier = loadPrettier();

  function inferParser(filepath?: string): PrettierParser {
    if (!filepath) {
      return DEFAULT_PARSER;
    }

    const { inferredParser } = prettier.getFileInfo.sync(filepath);
    return (inferredParser || DEFAULT_PARSER) as PrettierParser;
  }

  function resolvePrettierConfig(filepath?: string): Prettier.Options {
    return {
      parser: inferParser(filepath),
      ...(typeof filepath === 'string'
        ? prettier.resolveConfig.sync(filepath)
        : undefined),
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
          resolvePrettierConfig(options.filename)
        )
      };
    }
  };
}
