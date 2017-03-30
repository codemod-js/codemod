import * as Babel from 'babel-core';
import { existsSync, readFileSync } from 'fs';
import { hasMagic as hasGlob, sync as globSync } from 'glob';
import { basename, extname, resolve } from 'path';
import { sync as resolveSync } from 'resolve';
import { PathPredicate } from './iterateSources';
import { BabelPlugin, RawBabelPlugin } from './TransformRunner';

export const DEFAULT_EXTENSIONS = new Set(['.js', '.jsx']);
export type ParseOptionsResult = Options | Error;

export class Plugin {
  readonly declaredName?: string;

  constructor(
    readonly rawPlugin: RawBabelPlugin,
    readonly inferredName: string,
    readonly path?: string,
  ) {
    let instance = rawPlugin(Babel);

    if (instance.name) {
      this.declaredName = instance.name;
    }
  }

  static load(path: string, inferredName: string) {
    let exports = require(path);
    let plugin;

    if (exports.default) {
      plugin = exports.default;
    } else {
      plugin = exports;
    }

    let rawPlugin = plugin;

    return new Plugin(
      rawPlugin,
      inferredName,
      path
    );
  }
}

export default class Options {
  constructor(
    readonly sourcePaths: Array<string>,
    readonly plugins: Array<Plugin>,
    readonly pluginOptions: Map<string, object>,
    readonly extensions: Set<string>,
    readonly requires: Array<string>,
    readonly ignore: PathPredicate,
    readonly stdio: boolean,
    readonly help: boolean,
  ) {}

  getPlugins(): Array<Plugin> {
    return this.plugins;
  }

  loadRequires() {
    for (let modulePath of this.requires) {
      require(modulePath);
    }
  }

  getPlugin(name: string): Plugin | null {
    for (let plugin of this.plugins) {
      if (plugin.declaredName === name || plugin.inferredName === name) {
        return plugin;
      }
    }

    return null;
  }

  getBabelPlugins(): Array<BabelPlugin> {
    let result: Array<BabelPlugin> = [];

    for (let plugin of this.plugins) {
      let options = plugin.declaredName &&
        this.pluginOptions.get(plugin.declaredName) ||
        this.pluginOptions.get(plugin.inferredName);

      if (options) {
        result.push([plugin.rawPlugin, options]);
      } else {
        result.push(plugin.rawPlugin);
      }
    }

    return result;
  }

  getBabelPlugin(name: string): BabelPlugin | null {
    let plugin = this.getPlugin(name);

    if (!plugin) {
      return null;
    }

    let options = this.pluginOptions.get(name);

    if (options) {
      return [plugin.rawPlugin, options];
    } else {
      return plugin.rawPlugin;
    }
  }

  static parse(args: Array<string>): ParseOptionsResult {
    let sourcePaths: Array<string> = [];
    let plugins: Array<Plugin> = [];
    let pluginOptions: Map<string, object> = new Map();
    let extensions = DEFAULT_EXTENSIONS;
    let ignore = (path: string, basename: string, root: string) => basename[0] === '.';
    let requires: Array<string> = [];
    let stdio = false;
    let help = false;

    for (let i = 0; i < args.length; i++) {
      let arg = args[i];

      switch (arg) {
        case '-p':
        case '--plugin':
          i++;
          let path = args[i];
          plugins.push(Plugin.load(getRequirableModulePath(path), basename(path, extname(path))));
          break;

        case '-o':
        case '--plugin-options':
          i++;
          let nameAndOptions = args[i].split('=');
          let name = nameAndOptions[0];
          let optionsRaw = nameAndOptions[1];

          if (optionsRaw && optionsRaw[0] === '@') {
            optionsRaw = readFileSync(optionsRaw.slice(1), { encoding: 'utf8' });
            pluginOptions.set(name, JSON.parse(optionsRaw));
          }

          try {
            pluginOptions.set(name, JSON.parse(optionsRaw));
          } catch (err) {
            return new Error(`unable to parse JSON config for ${name}: ${optionsRaw}`);
          }
          break;

        case '-r':
        case '--require':
          i++;
          requires.push(getRequirableModulePath(args[i]));
          break;

        case '--extensions':
          i++;
          extensions = new Set(
            args[i]
              .split(',')
              .map(ext => ext[0] === '.' ? ext : `.${ext}`)
          );
          break;

        case '-s':
        case '--stdio':
          stdio = true;
          break;

        case '-h':
        case '--help':
          help = true;
          break;

        default:
          if (arg[0] === '-') {
            return new Error(`unexpected option: ${arg}`);
          } else {
            if (hasGlob(arg)) {
              sourcePaths.push(...globSync(arg));
            } else {
              sourcePaths.push(arg);
            }
          }
          break;
      }
    }

    return new Options(
      sourcePaths,
      plugins,
      pluginOptions,
      extensions,
      requires,
      ignore,
      stdio,
      help
    );
  }
}

/**
 * Gets a path that can be passed to `require` for a given module path.
 */
function getRequirableModulePath(modulePath: string): string {
  if (existsSync(modulePath) || existsSync(modulePath + '.js')) {
    return resolve(modulePath);
  } else {
    return resolveSync(modulePath, { basedir: process.cwd() });
  }
}
