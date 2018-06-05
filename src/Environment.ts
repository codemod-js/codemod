import * as Babel from '@babel/core';
import { basename, extname } from 'path';
import { install } from 'source-map-support';
import AllSyntaxPlugin from './AllSyntaxPlugin';
import { RawBabelPlugin } from './BabelPlugins';
import { BabelPlugin } from './BabelPluginTypes';
import BabelPrinterPlugin from './BabelPrinterPlugin';
import Config, { Printer } from './Config';
import PluginLoader from './PluginLoader';
import PrettierPrinterPlugin from './PrettierPrinterPlugin';
import ProcessSnapshot from './ProcessSnapshot';
import RecastPlugin from './RecastPlugin';
import AstExplorerResolver from './resolvers/AstExplorerResolver';
import FileSystemResolver from './resolvers/FileSystemResolver';
import NetworkResolver from './resolvers/NetworkResolver';
import PackageResolver from './resolvers/PackageResolver';
import { disable, enable } from './transpile-requires';

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

export interface EnvironmentStruct {
  transpilePlugins: boolean;
  findBabelConfig: boolean;
  requires: Array<string>;
  localPlugins: Array<string>;
  remotePlugins: Array<string>;
  pluginOptions: { [key: string]: object };
  printer: Printer;
}

export default class Environment {
  constructor(
    private readonly transpilePlugins: boolean,
    private readonly findBabelConfig: boolean,
    private readonly requires: Array<string>,
    private readonly localPlugins: Array<string>,
    private readonly remotePlugins: Array<string>,
    private readonly pluginOptions: Map<string, object>,
    private readonly printer: Printer
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

  toObject(): EnvironmentStruct {
    return {
      transpilePlugins: this.transpilePlugins,
      findBabelConfig: this.findBabelConfig,
      requires: this.requires,
      localPlugins: this.localPlugins,
      remotePlugins: this.remotePlugins,
      pluginOptions: Array.from(this.pluginOptions.entries()).reduce(
        (prev, [key, value]) => {
          prev[key] = value;
          return value;
        },
        {}
      ),
      printer: this.printer
    };
  }

  static fromConfig(config: Config): Environment {
    return new Environment(
      config.transpilePlugins,
      config.findBabelConfig,
      config.requires,
      config.localPlugins,
      config.remotePlugins,
      config.pluginOptions,
      config.printer
    );
  }

  static fromObject(object: EnvironmentStruct): Environment {
    return new Environment(
      object.transpilePlugins,
      object.findBabelConfig,
      object.requires,
      object.localPlugins,
      object.remotePlugins,
      new Map(
        Object.keys(object.pluginOptions).map(
          key => [key, object.pluginOptions[key]] as [string, object]
        )
      ),
      object.printer
    );
  }

  async loadPlugins(): Promise<Array<BabelPlugin>> {
    let snapshot = new ProcessSnapshot();
    let plugins: Array<BabelPlugin>;

    try {
      this.loadBabelTranspile();
      this.loadRequires();
      plugins = await this.getBabelPlugins();
    } finally {
      this.unloadBabelTranspile();
      snapshot.restore();
    }

    return plugins;
  }

  private async getPlugins(): Promise<Array<Plugin>> {
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

  private loadRequires() {
    for (let modulePath of this.requires) {
      require(modulePath);
    }
  }

  private loadBabelTranspile() {
    if (this.transpilePlugins) {
      enable(this.findBabelConfig);
      install();
    }
  }

  private unloadBabelTranspile() {
    if (this.transpilePlugins) {
      disable();
    }
  }

  private async getPlugin(name: string): Promise<Plugin | null> {
    for (let plugin of await this.getPlugins()) {
      if (plugin.declaredName === name || plugin.inferredName === name) {
        return plugin;
      }
    }

    return null;
  }

  private async getBabelPlugins(): Promise<Array<BabelPlugin>> {
    let result: Array<BabelPlugin> = [AllSyntaxPlugin];

    switch (this.printer) {
      case Printer.Recast:
        result.push(RecastPlugin);
        break;

      case Printer.Babel:
        result.push(BabelPrinterPlugin);
        break;

      case Printer.Prettier:
        result.push(PrettierPrinterPlugin);
        break;
    }

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
