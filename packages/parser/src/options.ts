import {
  ParserOptions as BabelParserOptions,
  ParserPlugin as BabelParserPlugin
} from '@babel/parser';

/**
 * Add some type plugins that are in master but not yet published.
 */
export type ParserPlugin =
  | BabelParserPlugin
  | 'logicalAssignment'
  | 'partialApplication'
  | 'placeholders';

type ParserPluginName = Extract<ParserPlugin, string>;

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
  'importMeta',
  'jsx',
  'logicalAssignment',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  'partialApplication',
  'placeholders',
  'throwExpressions',
  ['decorators', { decoratorsBeforeExport: true }],
  ['pipelineOperator', { proposal: 'smart' }]
]);

export interface ParserOptions extends Omit<BabelParserOptions, 'plugins'> {
  // TODO: remove this hack once `allowUndeclaredExports` is included in typings
  // https://github.com/babel/babel/pull/10263
  allowUndeclaredExports?: boolean;

  // TODO: Remove this.
  // https://github.com/babel/babel/pull/10291
  sourceFileName?: string;

  plugins?: Array<ParserPlugin>;
}

/**
 * Builds options for `@babel/parser` by enabling as many features as possible,
 * while also preserving the options given as an argument.
 */
export default function buildOptions({
  sourceType = 'unambiguous',
  allowAwaitOutsideFunction = true,
  allowImportExportEverywhere = true,
  allowReturnOutsideFunction = true,
  allowSuperOutsideMethod = true,
  allowUndeclaredExports = true,
  plugins = [],
  sourceFilename,
  sourceFileName,
  ...rest
}: ParserOptions = {}): ParserOptions {
  for (const plugin of DefaultParserPlugins) {
    if (shouldAddPlugin(plugins, getPluginName(plugin))) {
      plugins = [...plugins, plugin];
    }
  }

  const typePlugin = typePluginForSourceFileName(
    // https://github.com/babel/babel/pull/10291
    sourceFileName || sourceFilename
  );

  if (shouldAddPlugin(plugins, typePlugin)) {
    plugins = [...plugins, typePlugin];
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
    sourceFileName,
    ...rest
  };
}

/**
 * Gets plugins that cannot be enabled if the plugin given by `name` is enabled.
 *
 * @see https://github.com/babel/babel/blob/5fb4d84a33351c13057dc542513a3fe2309e08b0/packages/babel-parser/src/plugin-utils.js#L44-L49
 */
function getMutuallyExclusivePluginsForPlugin(
  name: ParserPluginName
): ReadonlyArray<ParserPluginName> {
  switch (name) {
    case 'flow':
    case 'flowComments':
      return ['typescript'];

    case 'typescript':
      return ['flow', 'flowComments'];

    case 'decorators':
      return ['decorators-legacy'];

    case 'decorators-legacy':
      return ['decorators'];

    default:
      return [];
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
  sourceFileName?: string
): 'flow' | 'typescript' {
  if (typeof sourceFileName === 'string' && !/\.tsx?$/i.test(sourceFileName)) {
    return 'flow';
  } else {
    return 'typescript';
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
  name: ParserPluginName
): boolean {
  if (pluginListIncludesPlugin(plugins, name)) {
    return false;
  }

  return !getMutuallyExclusivePluginsForPlugin(
    name
  ).some(mutuallyExclusivePlugin =>
    pluginListIncludesPlugin(plugins, mutuallyExclusivePlugin)
  );
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
  name: ParserPluginName
): boolean {
  return plugins.some(entry => getPluginName(entry) === name);
}

/**
 * Gets the name of `plugin`.
 *
 * @example
 *
 *   getPluginName('decorators');            // 'decorators'
 *   getPluginName(['flow', { all: true }]); // 'flow'
 */
function getPluginName(plugin: ParserPlugin): ParserPluginName {
  return typeof plugin === 'string' ? plugin : plugin[0];
}
