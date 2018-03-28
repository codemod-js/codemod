import * as Babel from '@babel/core';
import { basename, extname } from 'path';
import { install } from 'source-map-support';
import AllSyntaxPlugin from './AllSyntaxPlugin';
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

function ignoreDotfiles(path: string, basename: string, root: string): boolean {
  return basename.startsWith('.');
}

export default class Config {
  constructor(
    readonly sourcePaths: Array<string> = [],
    readonly localPlugins: Array<string> = [],
    readonly remotePlugins: Array<string> = [],
    readonly pluginOptions: Map<string, object> = new Map<string, object>(),
    readonly extensions: Set<string> = DEFAULT_EXTENSIONS,
    readonly requires: Array<string> = [],
    readonly transpilePlugins: boolean = true,
    readonly findBabelConfig: boolean = false,
    readonly ignore: PathPredicate = ignoreDotfiles,
    readonly stdio: boolean = false,
    readonly dry: boolean = false
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
    let result: Array<BabelPlugin> = [AllSyntaxPlugin, RecastPlugin];

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
}

export class ConfigBuilder {
  private _sourcePaths?: Array<string>;
  private _localPlugins?: Array<string>;
  private _remotePlugins?: Array<string>;
  private _pluginOptions?: Map<string, object>;
  private _extensions?: Set<string>;
  private _requires?: Array<string>;
  private _transpilePlugins?: boolean;
  private _findBabelConfig?: boolean;
  private _ignore?: PathPredicate;
  private _stdio?: boolean;
  private _dry?: boolean;

  sourcePaths(value: Array<string>): this {
    this._sourcePaths = value;
    return this;
  }

  addSourcePath(value: string): this {
    if (!this._sourcePaths) {
      this._sourcePaths = [];
    }
    this._sourcePaths.push(value);
    return this;
  }

  addSourcePaths(...values: Array<string>): this {
    for (let value of values) {
      this.addSourcePath(value);
    }
    return this;
  }

  localPlugins(value: Array<string>): this {
    this._localPlugins = value;
    return this;
  }

  addLocalPlugin(value: string): this {
    if (!this._localPlugins) {
      this._localPlugins = [];
    }
    this._localPlugins.push(value);
    return this;
  }

  remotePlugins(value: Array<string>): this {
    this._remotePlugins = value;
    return this;
  }

  addRemotePlugin(value: string): this {
    if (!this._remotePlugins) {
      this._remotePlugins = [];
    }
    this._remotePlugins.push(value);
    return this;
  }

  pluginOptions(value: Map<string, object>): this {
    this._pluginOptions = value;
    return this;
  }

  setOptionsForPlugin(options: object, plugin: string): this {
    if (!this._pluginOptions) {
      this._pluginOptions = new Map();
    }
    this._pluginOptions.set(plugin, options);
    return this;
  }

  extensions(value: Set<string>): this {
    this._extensions = value;
    return this;
  }

  addExtension(value: string): this {
    if (!this._extensions) {
      this._extensions = new Set();
    }
    this._extensions.add(value);
    return this;
  }

  requires(value: Array<string>): this {
    this._requires = value;
    return this;
  }

  addRequire(value: string): this {
    if (!this._requires) {
      this._requires = [];
    }
    this._requires.push(value);
    return this;
  }

  transpilePlugins(value: boolean): this {
    this._transpilePlugins = value;
    return this;
  }

  findBabelConfig(value: boolean): this {
    this._findBabelConfig = value;
    return this;
  }

  ignore(value: PathPredicate): this {
    this._ignore = value;
    return this;
  }

  stdio(value: boolean): this {
    this._stdio = value;
    return this;
  }

  dry(value: boolean): this {
    this._dry = value;
    return this;
  }

  build(): Config {
    return new Config(
      this._sourcePaths,
      this._localPlugins,
      this._remotePlugins,
      this._pluginOptions,
      this._extensions,
      this._requires,
      this._transpilePlugins,
      this._findBabelConfig,
      this._ignore,
      this._stdio,
      this._dry
    );
  }
}
