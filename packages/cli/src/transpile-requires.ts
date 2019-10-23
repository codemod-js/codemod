import { PluginItem } from '@babel/core';
import { transform, TransformOptions } from '@codemod/core';
import { extname } from 'path';
import { addHook } from 'pirates';
import { PluginExtensions, TypeScriptExtensions } from './extensions';

let useBabelConfig = false;
let revert: (() => void) | null = null;

export function hook(code: string, filename: string): string {
  const ext = extname(filename);

  if (!PluginExtensions.has(ext)) {
    throw new Error(`cannot load file type '${ext}': ${filename}`);
  }

  const plugins: Array<PluginItem> = [];
  const presets: Array<PluginItem> = [];
  const options: TransformOptions = {
    filename,
    babelrc: useBabelConfig,
    presets,
    plugins,
    sourceMaps: 'inline'
  };

  plugins.push(require.resolve('@babel/plugin-proposal-class-properties'));

  if (!useBabelConfig) {
    options.configFile = useBabelConfig;
  }

  if (!useBabelConfig) {
    if (TypeScriptExtensions.has(ext)) {
      presets.push(require.resolve('@babel/preset-typescript'));
    }

    presets.push([
      require.resolve('@babel/preset-env'),
      { useBuiltIns: 'entry', corejs: { version: 3, proposals: true } }
    ]);
  }

  const result = transform(code, options);

  if (!result) {
    throw new Error(`[${filename}] babel transform returned null`);
  }

  return result.code as string;
}

export function enable(shouldUseBabelConfig = false): void {
  disable();
  useBabelConfig = shouldUseBabelConfig;
  require('core-js');
  require('regenerator-runtime');
  revert = addHook(hook, {
    exts: Array.from(PluginExtensions),
    ignoreNodeModules: true
  });
}

export function disable(): void {
  if (revert) {
    revert();
    revert = null;
  }
}
