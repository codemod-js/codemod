import {
  TransformOptions as BabelTransformOptions,
  BabelFileResult,
  transformSync
} from '@babel/core';
import RecastPlugin from './RecastPlugin';
import { BabelPlugin } from './BabelPluginTypes';
import PrettierPrinterPlugin from './PrettierPrinterPlugin';
import BabelPrinterPlugin from './BabelPrinterPlugin';
import buildAllSyntaxPlugin from './AllSyntaxPlugin';

export enum Printer {
  Recast = 'recast',
  Prettier = 'prettier',
  Babel = 'babel'
}

export interface TransformOptions extends BabelTransformOptions {
  printer?: Printer;
}

/**
 * Transform `code` using `@babel/core` with a custom parser & printer, which
 * defaults to `recast`. Additionally, `@codemod/parser` is used to enable as
 * many parser plugins as possible.
 */
export function transform(
  code: string,
  { printer, ...options }: TransformOptions = {}
): BabelFileResult {
  return transformSync(code, {
    ...options,
    plugins: [
      ...(options.plugins || []),
      buildAllSyntaxPlugin(options.sourceType || 'unambiguous'),
      loadPrinterPlugin(printer)
    ]
  }) as BabelFileResult;
}

function loadPrinterPlugin(printer?: Printer): BabelPlugin {
  switch (printer) {
    case undefined:
    case Printer.Recast:
      return RecastPlugin;

    case Printer.Prettier:
      return PrettierPrinterPlugin;

    case Printer.Babel:
      return BabelPrinterPlugin;

    default:
      throw new Error(`unknown printer: ${printer}`);
  }
}
