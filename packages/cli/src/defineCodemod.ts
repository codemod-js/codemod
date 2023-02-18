import * as Utils from '@codemod/utils'

/**
 * Defines a codemod function that can be used with `@codemod/cli`,
 * `@codemod/core`, or `@babel/core`.
 */
export function defineCodemod<T>(
  fn: (utils: typeof Utils, options: T) => Utils.Babel.PluginItem
) {
  return function (_, options: T) {
    return fn(Utils, options)
  }
}
