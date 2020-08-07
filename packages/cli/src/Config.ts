import * as Babel from '@babel/core'
import { ParserOptions } from '@codemod/parser'
import { basename, extname } from 'path'
import { install } from 'source-map-support'
import { TransformableExtensions } from './extensions'
import { PathPredicate } from './iterateSources'
import PluginLoader from './PluginLoader'
import AstExplorerResolver from './resolvers/AstExplorerResolver'
import FileSystemResolver from './resolvers/FileSystemResolver'
import NetworkResolver from './resolvers/NetworkResolver'
import PackageResolver from './resolvers/PackageResolver'
import { disable, enable } from './transpile-requires'
import { EntryType } from './System'

export class Plugin {
  readonly declaredName?: string

  constructor(
    readonly rawPlugin: (babel: typeof Babel) => Babel.PluginObj,
    readonly inferredName: string,
    readonly source?: string,
    readonly resolvedPath?: string
  ) {
    try {
      const instance = rawPlugin(Babel)

      if (instance.name) {
        this.declaredName = instance.name
      }
    } catch {
      // We won't be able to determine what the plugin names itself ¯\_(ツ)_/¯
    }
  }
}

function defaultIgnorePredicate(
  path: string,
  basename: string,
  root: string,
  type: EntryType
): boolean {
  return (
    // ignore paths starting with a dot
    basename.startsWith('.') ||
    // ignore TypeScript declaration files
    (basename.endsWith('.d.ts') && type === EntryType.File) ||
    // ignore node_modules directories
    (basename === 'node_modules' && type === EntryType.Directory)
  )
}

export enum Printer {
  Recast = 'recast',
  Prettier = 'prettier',
  Babel = 'babel',
}

export default class Config {
  constructor(
    readonly sourcePaths: Array<string> = [],
    readonly localPlugins: Array<string> = [],
    readonly remotePlugins: Array<string> = [],
    readonly pluginOptions: Map<string, object> = new Map<string, object>(),
    readonly printer: Printer = Printer.Recast,
    readonly extensions: Set<string> = TransformableExtensions,
    readonly sourceType: ParserOptions['sourceType'] = 'unambiguous',
    readonly requires: Array<string> = [],
    readonly transpilePlugins: boolean = true,
    readonly findBabelConfig: boolean = false,
    readonly ignore: PathPredicate = defaultIgnorePredicate,
    readonly stdio: boolean = false,
    readonly dry: boolean = false
  ) {}

  private pluginLoader = new PluginLoader([
    new FileSystemResolver(),
    new PackageResolver(),
  ])

  private remotePluginLoader = new PluginLoader([
    new AstExplorerResolver(),
    new NetworkResolver(),
  ])

  private _pluginCache?: Array<Plugin>

  async getPlugins(): Promise<Array<Plugin>> {
    if (!this._pluginCache) {
      const localPlugins = Promise.all(
        this.localPlugins.map(async (localPlugin) => {
          const pluginExports = await this.pluginLoader.load(localPlugin)
          const defaultExport = pluginExports['default'] || pluginExports

          return new Plugin(
            defaultExport,
            basename(localPlugin, extname(localPlugin)),
            localPlugin
          )
        })
      )

      const remotePlugins = Promise.all(
        this.remotePlugins.map(async (remotePlugin) => {
          const pluginExports = await this.remotePluginLoader.load(remotePlugin)
          const defaultExport = pluginExports['default'] || pluginExports

          return new Plugin(
            defaultExport,
            basename(remotePlugin, extname(remotePlugin)),
            remotePlugin
          )
        })
      )

      this._pluginCache = [...(await localPlugins), ...(await remotePlugins)]
    }

    return this._pluginCache
  }

  loadRequires(): void {
    for (const modulePath of this.requires) {
      require(modulePath)
    }
  }

  loadBabelTranspile(): void {
    if (this.transpilePlugins) {
      enable(this.findBabelConfig)
      install()
    }
  }

  unloadBabelTranspile(): void {
    if (this.transpilePlugins) {
      disable()
    }
  }

  async getPlugin(name: string): Promise<Plugin | null> {
    for (const plugin of await this.getPlugins()) {
      if (
        plugin.declaredName === name ||
        plugin.inferredName === name ||
        plugin.source === name
      ) {
        return plugin
      }
    }

    return null
  }

  async getBabelPlugins(): Promise<Array<Babel.PluginItem>> {
    const result: Array<Babel.PluginItem> = []

    for (const plugin of await this.getPlugins()) {
      const options =
        (plugin.declaredName && this.pluginOptions.get(plugin.declaredName)) ||
        this.pluginOptions.get(plugin.inferredName) ||
        (plugin.source && this.pluginOptions.get(plugin.source))

      if (options) {
        result.push([plugin.rawPlugin, options])
      } else {
        result.push(plugin.rawPlugin)
      }
    }

    return result
  }

  async getBabelPlugin(name: string): Promise<Babel.PluginItem | null> {
    const plugin = await this.getPlugin(name)

    if (!plugin) {
      return null
    }

    const options = this.pluginOptions.get(name)

    if (options) {
      return [plugin.rawPlugin, options]
    } else {
      return plugin.rawPlugin
    }
  }
}

export class ConfigBuilder {
  private _sourcePaths?: Array<string>
  private _localPlugins?: Array<string>
  private _remotePlugins?: Array<string>
  private _pluginOptions?: Map<string, object>
  private _printer?: Printer
  private _extensions: Set<string> = new Set(TransformableExtensions)
  private _sourceType: ParserOptions['sourceType'] = 'module'
  private _requires?: Array<string>
  private _transpilePlugins?: boolean
  private _findBabelConfig?: boolean
  private _ignore?: PathPredicate
  private _stdio?: boolean
  private _dry?: boolean

  sourcePaths(value: Array<string>): this {
    this._sourcePaths = value
    return this
  }

  addSourcePath(value: string): this {
    if (!this._sourcePaths) {
      this._sourcePaths = []
    }
    this._sourcePaths.push(value)
    return this
  }

  addSourcePaths(...values: Array<string>): this {
    for (const value of values) {
      this.addSourcePath(value)
    }
    return this
  }

  localPlugins(value: Array<string>): this {
    this._localPlugins = value
    return this
  }

  addLocalPlugin(value: string): this {
    if (!this._localPlugins) {
      this._localPlugins = []
    }
    this._localPlugins.push(value)
    return this
  }

  remotePlugins(value: Array<string>): this {
    this._remotePlugins = value
    return this
  }

  addRemotePlugin(value: string): this {
    if (!this._remotePlugins) {
      this._remotePlugins = []
    }
    this._remotePlugins.push(value)
    return this
  }

  pluginOptions(value: Map<string, object>): this {
    this._pluginOptions = value
    return this
  }

  setOptionsForPlugin(options: object, plugin: string): this {
    if (!this._pluginOptions) {
      this._pluginOptions = new Map()
    }
    this._pluginOptions.set(plugin, options)
    return this
  }

  printer(value: Printer): this {
    this._printer = value
    return this
  }

  extensions(value: Set<string>): this {
    this._extensions = value
    return this
  }

  addExtension(value: string): this {
    if (!this._extensions) {
      this._extensions = new Set()
    }
    this._extensions.add(value)
    return this
  }

  sourceType(value: ParserOptions['sourceType']): this {
    this._sourceType = value
    return this
  }

  requires(value: Array<string>): this {
    this._requires = value
    return this
  }

  addRequire(value: string): this {
    if (!this._requires) {
      this._requires = []
    }
    this._requires.push(value)
    return this
  }

  transpilePlugins(value: boolean): this {
    this._transpilePlugins = value
    return this
  }

  findBabelConfig(value: boolean): this {
    this._findBabelConfig = value
    return this
  }

  ignore(value: PathPredicate): this {
    this._ignore = value
    return this
  }

  stdio(value: boolean): this {
    this._stdio = value
    return this
  }

  dry(value: boolean): this {
    this._dry = value
    return this
  }

  build(): Config {
    return new Config(
      this._sourcePaths,
      this._localPlugins,
      this._remotePlugins,
      this._pluginOptions,
      this._printer,
      this._extensions,
      this._sourceType,
      this._requires,
      this._transpilePlugins,
      this._findBabelConfig,
      this._ignore,
      this._stdio,
      this._dry
    )
  }
}
