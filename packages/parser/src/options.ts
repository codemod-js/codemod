import type {
  DecoratorsPluginOptions,
  FlowPluginOptions,
  ParserOptions as BabelParserOptions,
  ParserPlugin,
  PipelineOperatorPluginOptions,
  RecordAndTuplePluginOptions,
  TypeScriptPluginOptions,
} from '@babel/parser'

export type ParserPluginName =
  | Extract<ParserPlugin, string>
  | Extract<ParserPlugin, [string, object]>[0]

type ParserPluginOptions = Extract<ParserPlugin, [string, object]>[1]

const DefaultParserPlugins = new Set<ParserPlugin>([
  'asyncGenerators',
  'bigInt',
  'classPrivateMethods',
  'classPrivateProperties',
  'classProperties',
  'doExpressions',
  'dynamicImport',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'functionBind',
  'functionSent',
  'importAssertions',
  'importMeta',
  'jsx',
  'logicalAssignment',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  'partialApplication',
  'throwExpressions',
  'topLevelAwait',
  ['decorators', { decoratorsBeforeExport: true }],
  'decorators-legacy',
  ['pipelineOperator', { proposal: 'minimal' }],
  ['recordAndTuple', { syntaxType: 'hash' }],
])

export function isParserPluginName(name: string): name is ParserPluginName {
  for (const plugin of DefaultParserPlugins) {
    if (name === getPluginName(plugin)) {
      return true
    }
  }
  return false
}

export interface ParserOptions extends Omit<BabelParserOptions, 'plugins'> {
  plugins?: Array<ParserPlugin>
}

/**
 * Builds options for `@babel/parser` by enabling as many features as possible,
 * while also preserving the options given as an argument.
 */
export function buildOptions({
  sourceType = 'unambiguous',
  allowAwaitOutsideFunction = true,
  allowImportExportEverywhere = true,
  allowReturnOutsideFunction = true,
  allowSuperOutsideMethod = true,
  allowUndeclaredExports = true,
  plugins = [],
  sourceFilename,
  ...rest
}: ParserOptions = {}): ParserOptions {
  for (const plugin of DefaultParserPlugins) {
    if (shouldAddPlugin(plugins, plugin)) {
      plugins = [...plugins, plugin]
    }
  }

  const typePlugin = typePluginForSourceFileName(sourceFilename)

  if (shouldAddPlugin(plugins, typePlugin)) {
    plugins = [...plugins, typePlugin]
  }

  return {
    sourceType,
    allowAwaitOutsideFunction,
    allowImportExportEverywhere,
    allowReturnOutsideFunction,
    allowSuperOutsideMethod,
    allowUndeclaredExports,
    plugins,
    sourceFilename,
    ...rest,
  }
}

/**
 * Gets the type plugin to use for a given file name.
 *
 * @example
 *
 *   typePluginForSourceFileName('index.ts');  // 'typescript'
 *   typePluginForSourceFileName('index.jsx'); // 'flow'
 */
function typePluginForSourceFileName(
  sourceFileName?: string,
): 'flow' | 'typescript' {
  if (typeof sourceFileName === 'string' && !/\.tsx?$/i.test(sourceFileName)) {
    return 'flow'
  } else {
    return 'typescript'
  }
}

function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: 'decorators',
): DecoratorsPluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: 'pipelineOperator',
): PipelineOperatorPluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: 'recordAndTuple',
): RecordAndTuplePluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: 'flow',
): FlowPluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: 'typescript',
): TypeScriptPluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): ParserPluginOptions | undefined
function getPluginOptions(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): ParserPluginOptions | undefined {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      if (plugin[0] === name) {
        return plugin[1]
      }
    } else if (plugin === name) {
      return {}
    }
  }
}

/**
 * Determines whether a plugin list can accept a new plugin by name.
 *
 * @example
 *
 *   shouldAddPlugin([], 'jsx');                // true; existing list does not have "jsx"
 *   shouldAddPlugin(['jsx', 'bigInt'], 'jsx'); // false; existing list already has "jsx"
 *   shouldAddPlugin(['flow'], 'typescript');   // false; "typescript" is incompatible with "flow"
 */
function shouldAddPlugin(
  plugins: Array<ParserPlugin>,
  plugin: ParserPlugin,
): boolean {
  const name = getPluginName(plugin)

  if (pluginListIncludesPlugin(plugins, name)) {
    return false
  }

  switch (name) {
    case 'flow':
    case 'flowComments':
      return !getPluginOptions(plugins, 'typescript')

    case 'typescript':
      return !(
        getPluginOptions(plugins, 'flow') ||
        getPluginOptions(plugins, 'flowComments')
      )

    case 'decorators':
      return !getPluginOptions(plugins, 'decorators-legacy')

    case 'decorators-legacy':
      return !getPluginOptions(plugins, 'decorators')

    case 'recordAndTuple':
    case 'pipelineOperator': {
      const recordAndTupleOptions =
        name === 'recordAndTuple'
          ? (plugin[1] as RecordAndTuplePluginOptions)
          : getPluginOptions(plugins, 'recordAndTuple')
      const pipelineOperatorOptions =
        name === 'pipelineOperator'
          ? (plugin[1] as PipelineOperatorPluginOptions)
          : getPluginOptions(plugins, 'pipelineOperator')

      if (recordAndTupleOptions?.syntaxType === 'hash') {
        // https://github.com/babel/babel/blob/15f2f171ab13b224757ca43483a456e409f12a0a/packages/babel-parser/src/plugin-utils.js#L124-L128
        if (pipelineOperatorOptions?.proposal === 'smart') {
          return false
        }

        // https://github.com/babel/babel/blob/15f2f171ab13b224757ca43483a456e409f12a0a/packages/babel-parser/src/plugin-utils.js#L119-L123
        if (
          pipelineOperatorOptions?.proposal === 'hack' &&
          pipelineOperatorOptions.topicToken === '#'
        ) {
          return false
        }
      }

      return true
    }

    default:
      return true
  }
}

/**
 * Checks `plugins` for an entry named `name`.
 *
 * @example
 *
 *   pluginListIncludesPlugin(['jsx', 'bigInt'], 'bigInt');              // true; list includes "bigInt" without options
 *   pluginListIncludesPlugin(['jsx', 'bigInt'], 'flow');                // false; list does not include "flow"
 *   pluginListIncludesPlugin(['jsx', ['flow', { all: true }]], 'flow'); // true; list includes "flow" with options
 */
function pluginListIncludesPlugin(
  plugins: Array<ParserPlugin>,
  name: ParserPluginName,
): boolean {
  return plugins.some((entry) => getPluginName(entry) === name)
}

/**
 * Gets the name of `plugin`.
 *
 * @example
 *
 *   getPluginName('decorators');            // 'decorators'
 *   getPluginName(['flow', { all: true }]); // 'flow'
 */
export function getPluginName(plugin: ParserPlugin): ParserPluginName {
  return typeof plugin === 'string' ? plugin : plugin[0]
}
