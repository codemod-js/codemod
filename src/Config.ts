import { PathPredicate } from './iterateSources';

export const DEFAULT_EXTENSIONS = new Set(['.js', '.jsx']);

function ignoreDotfiles(path: string, basename: string, root: string): boolean {
  return basename.startsWith('.');
}

export enum Printer {
  Recast = 'recast',
  Prettier = 'prettier',
  Babel = 'babel'
}

export default class Config {
  constructor(
    readonly sourcePaths: Array<string> = [],
    readonly localPlugins: Array<string> = [],
    readonly remotePlugins: Array<string> = [],
    readonly pluginOptions: Map<string, object> = new Map<string, object>(),
    readonly printer: Printer = Printer.Recast,
    readonly extensions: Set<string> = DEFAULT_EXTENSIONS,
    readonly requires: Array<string> = [],
    readonly transpilePlugins: boolean = true,
    readonly findBabelConfig: boolean = false,
    readonly ignore: PathPredicate = ignoreDotfiles,
    readonly stdio: boolean = false,
    readonly dry: boolean = false
  ) {}
}

export class ConfigBuilder {
  private _sourcePaths?: Array<string>;
  private _localPlugins?: Array<string>;
  private _remotePlugins?: Array<string>;
  private _pluginOptions?: Map<string, object>;
  private _printer?: Printer;
  private _extensions: Set<string> = new Set(DEFAULT_EXTENSIONS);
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

  printer(value: Printer): this {
    this._printer = value;
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
      this._printer,
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
