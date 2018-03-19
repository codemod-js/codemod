import * as Babel from '@babel/core';
import { existsSync, readFileSync } from 'fs';
import { hasMagic as hasGlob, sync as globSync } from 'glob';
import { basename, extname, resolve } from 'path';
import { sync as resolveSync } from 'resolve';
import { install } from 'source-map-support';
import { PathPredicate } from './iterateSources';
import PluginLoader from './PluginLoader';
import RecastPlugin from './RecastPlugin';
import AstExplorerResolver from './resolvers/AstExplorerResolver';
import FileSystemResolver from './resolvers/FileSystemResolver';
import NetworkResolver from './resolvers/NetworkResolver';
import PackageResolver from './resolvers/PackageResolver';
import { BabelPlugin, RawBabelPlugin } from './TransformRunner';
import { disable, enable } from './transpile-requires';

export const DEFAULT_EXTENSIONS = new Set(['.js', '.jsx']);
export type ParseOptionsResult = Options | Error;

export class Plugin {
  readonly declaredName?: string;

  constructor(
    readonly rawPlugin: RawBabelPlugin,
    readonly inferredName: string,
    readonly source?: string,
    readonly resolvedPath?: string
  ) {
    let instance = rawPlugin(Babel);

    if (instance.name) {
      this.declaredName = instance.name;
    }
  }
}

export default class Options {
  constructor(
    readonly sourcePaths: Array<string>,
    readonly localPlugins: Array<string>,
    readonly remotePlugins: Array<string>,
    readonly pluginOptions: Map<string, object>,
    readonly extensions: Set<string>,
    readonly requires: Array<string>,
    readonly transpilePlugins: boolean,
    readonly findBabelConfig: boolean,
    readonly ignore: PathPredicate,
    readonly stdio: boolean,
    readonly help: boolean,
    readonly version: boolean,
    readonly dry: boolean
  ) {}

  private pluginLoader = new PluginLoader([
    new FileSystemResolver(),
    new PackageResolver()
  ]);

  private remotePluginLoader = new PluginLoader([
    new AstExplorerResolver(),
    new NetworkResolver()
  ]);

  private _pluginCache?: Array<Plugin>;

  async getPlugins(): Promise<Array<Plugin>> {
    if (!this._pluginCache) {
      let localPlugins = Promise.all(
        this.localPlugins.map(async localPlugin => {
          let pluginExports = await this.pluginLoader.load(localPlugin);
          let defaultExport = pluginExports['default'] || pluginExports;

          return new Plugin(
            defaultExport,
            basename(localPlugin, extname(localPlugin))
          );
        })
      );

      let remotePlugins = Promise.all(
        this.remotePlugins.map(async remotePlugin => {
          let pluginExports = await this.remotePluginLoader.load(remotePlugin);
          let defaultExport = pluginExports['default'] || pluginExports;

          return new Plugin(
            defaultExport,
            basename(remotePlugin, extname(remotePlugin))
          );
        })
      );

      this._pluginCache = [...(await localPlugins), ...(await remotePlugins)];
    }

    return this._pluginCache;
  }

  loadRequires() {
    for (let modulePath of this.requires) {
      require(modulePath);
    }
  }

  loadBabelTranspile() {
    if (this.transpilePlugins) {
      enable(this.findBabelConfig);
      install();
    }
  }

  unloadBabelTranspile() {
    if (this.transpilePlugins) {
      disable();
    }
  }

  async getPlugin(name: string): Promise<Plugin | null> {
    for (let plugin of await this.getPlugins()) {
      if (plugin.declaredName === name || plugin.inferredName === name) {
        return plugin;
      }
    }

    return null;
  }

  async getBabelPlugins(): Promise<Array<BabelPlugin>> {
    let result: Array<BabelPlugin> = [RecastPlugin];

    for (let plugin of await this.getPlugins()) {
      let options =
        (plugin.declaredName && this.pluginOptions.get(plugin.declaredName)) ||
        this.pluginOptions.get(plugin.inferredName);

      if (options) {
        result.push([plugin.rawPlugin, options]);
      } else {
        result.push(plugin.rawPlugin);
      }
    }

    return result;
  }

  async getBabelPlugin(name: string): Promise<BabelPlugin | null> {
    let plugin = await this.getPlugin(name);

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
    let localPlugins: Array<string> = [];
    let remotePlugins: Array<string> = [];
    let pluginOptions: Map<string, object> = new Map();
    let extensions = DEFAULT_EXTENSIONS;
    let ignore = (path: string, basename: string, root: string) =>
      basename[0] === '.';
    let requires: Array<string> = [];
    let findBabelConfig = false;
    let transpilePlugins = true;
    let stdio = false;
    let help = false;
    let version = false;
    let dry = false;

    for (let i = 0; i < args.length; i++) {
      let arg = args[i];

      switch (arg) {
        case '-p':
        case '--plugin':
          i++;
          localPlugins.push(args[i]);
          break;

        case '--remote-plugin':
          i++;
          remotePlugins.push(args[i]);
          break;

        case '-o':
        case '--plugin-options':
          i++;
          let nameAndOptions = args[i].split('=');
          let name = nameAndOptions[0];
          let optionsRaw = nameAndOptions[1];

          if (optionsRaw && optionsRaw[0] === '@') {
            optionsRaw = readFileSync(optionsRaw.slice(1), {
              encoding: 'utf8'
            });
            pluginOptions.set(name, JSON.parse(optionsRaw));
          }

          try {
            pluginOptions.set(name, JSON.parse(optionsRaw));
          } catch (err) {
            return new Error(
              `unable to parse JSON config for ${name}: ${optionsRaw}`
            );
          }
          break;

        case '-r':
        case '--require':
          i++;
          requires.push(getRequirableModulePath(args[i]));
          break;

        case '--transpile-plugins':
        case '--no-transpile-plugins':
          transpilePlugins = arg === '--transpile-plugins';
          break;

        case '--find-babel-config':
        case '--no-find-babel-config':
          findBabelConfig = arg === '--find-babel-config';
          break;

        case '--extensions':
          i++;
          extensions = new Set(
            args[i].split(',').map(ext => (ext[0] === '.' ? ext : `.${ext}`))
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

        case '--version':
          version = true;
          break;

        case '-d':
        case '--dry':
          dry = true;
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
      localPlugins,
      remotePlugins,
      pluginOptions,
      extensions,
      requires,
      transpilePlugins,
      findBabelConfig,
      ignore,
      stdio,
      help,
      version,
      dry
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
