import { transformSync, TransformOptions, PluginItem } from '@babel/core';
import { extname } from 'path';
import { addHook } from 'pirates';
import buildAllSyntaxPlugin from './AllSyntaxPlugin';
import { PluginExtensions, TypeScriptExtensions } from './extensions';

let useBabelConfig = false;
let revert: (() => void) | null = null;

export function hook(code: string, filename: string): string {
  let ext = extname(filename);

  if (!PluginExtensions.has(ext)) {
    throw new Error(`cannot load file type '${ext}': ${filename}`);
  }

  let plugins: Array<PluginItem> = [];
  let presets: Array<PluginItem> = [];
  let options: TransformOptions = {
    filename,
    babelrc: useBabelConfig,
    presets,
    plugins,
    sourceMaps: 'inline'
  };

  plugins.push(
    buildAllSyntaxPlugin('module'),
    require.resolve('@babel/plugin-proposal-class-properties')
  );

  if (!useBabelConfig) {
    options.configFile = useBabelConfig;
  }

  if (!useBabelConfig) {
    if (TypeScriptExtensions.has(ext)) {
      presets.push(require.resolve('@babel/preset-typescript'));
    }

    presets.push([
      require.resolve('@babel/preset-env'),
      { useBuiltIns: 'entry' }
    ]);
  }

  let result = transformSync(code, options);

  if (!result) {
    throw new Error(`[${filename}] babel transform returned null`);
  }

  return result.code as string;
}

export function enable(shouldUseBabelConfig: boolean = false): void {
  disable();
  useBabelConfig = shouldUseBabelConfig;
  require('@babel/polyfill');
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
