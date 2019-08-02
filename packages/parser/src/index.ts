import { parse as babelParse } from '@babel/parser';
import { File } from '@babel/types';
import buildOptions, { ParserOptions } from './options';

export { buildOptions, ParserOptions };

/**
 * Wraps `parse` from `@babel/parser`, but sets default options such that as few
 * restrictions as possible are placed on the `input` code.
 */
export function parse(input: string, options?: ParserOptions): File {
  return babelParse(input, buildOptions(options));
}
