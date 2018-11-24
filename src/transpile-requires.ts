import { transformSync, TransformOptions } from '@babel/core';
import { extname } from 'path';
import { addHook } from 'pirates';
import buildAllSyntaxPlugin from './AllSyntaxPlugin';
import { PluginExtensions, TypeScriptExtensions } from './extensions';

let useBabelrc = false;
let revert: (() => void) | null = null;

export function hook(code: string, filename: string): string {
  let ext = extname(filename);

  if (!PluginExtensions.has(ext)) {
    throw new Error(`cannot load file type '${ext}': ${filename}`);
  }

  let presets: Array<string> = [];
  let options: TransformOptions = {
    filename,
    babelrc: useBabelrc,
    presets: presets,
    plugins: [buildAllSyntaxPlugin('module')],
    sourceMaps: 'inline'
  };

  if (!useBabelrc) {
    if (TypeScriptExtensions.has(ext)) {
      presets.push(require.resolve('@babel/preset-typescript'));
    }

    presets.push(require.resolve('@babel/preset-env'));
  }

  let result = transformSync(code, options);

  if (!result) {
    throw new Error(`[${filename}] babel transform returned null`);
  }

  return result.code as string;
}

export function enable(babelrc: boolean = false) {
  disable();
  useBabelrc = babelrc;
  revert = addHook(hook, {
    exts: Array.from(PluginExtensions),
    ignoreNodeModules: true
  });
}

export function disable() {
  if (revert) {
    revert();
    revert = null;
  }
}
