import { existsSync, readFileSync } from 'fs';
import { basename, extname, resolve } from 'path';
import { sync as resolveSync } from 'resolve';
import { PathPredicate } from './iterateSources';
import { Plugin } from './TransformRunner';

export const DEFAULT_EXTENSIONS = new Set(['.js', '.jsx']);
export type ParseOptionsResult = Options | Error;

export default class Options {
  private plugins?: Array<Plugin>;

  constructor(
    readonly sourcePaths: Array<string>,
    readonly pluginFilePaths: Array<string>,
    readonly pluginOptions: Map<string, object>,
    readonly extensions: Set<string>,
    readonly requires: Array<string>,
    readonly ignore: PathPredicate,
    readonly stdio: boolean,
    readonly help: boolean,
  ) {}

  getPlugins(): Array<Plugin> {
    if (!this.plugins) {
      this.plugins = this.loadPlugins();
    }

    return this.plugins;
  }

  loadRequires() {
    for (let modulePath of this.requires) {
      require(modulePath);
    }
  }

  private loadPlugins(): Array<Plugin> {
    return this.pluginFilePaths.map(pluginFilePath => {
      let name = basename(pluginFilePath, extname(pluginFilePath));
      let options = this.pluginOptions.get(name);
      let exports = require(pluginFilePath);
      let plugin;

      if (exports.default) {
        plugin = exports.default;
      } else {
        plugin = exports;
      }

      if (options) {
        return [plugin, options];
      } else {
        return plugin;
      }
    });
  }

  static parse(args: Array<string>): ParseOptionsResult {
    let sourcePaths: Array<string> = [];
    let pluginFilePaths: Array<string> = [];
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
          pluginFilePaths.push(getRequirableModulePath(args[i]));
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
            sourcePaths.push(arg);
          }
          break;
      }
    }

    return new Options(
      sourcePaths,
      pluginFilePaths,
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
