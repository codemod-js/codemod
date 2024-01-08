import * as utils from '@codemod/utils'
import * as matchers from '@codemod/matchers'

/**
 * Defines a codemod function that can be used with `@codemod/cli`,
 * `@codemod/core`, or `@babel/core`. Provides easy access to the
 * `@codemod/matchers` and `@codemod/utils` APIs.
 */
export function defineCodemod<T>(
  fn: (
    helpers: {
      utils: typeof utils
      matchers: typeof matchers
      types: typeof utils.types
      m: typeof matchers
      t: typeof utils.types
    },
    options?: T,
  ) => utils.Babel.PluginItem,
) {
  return function (_?: unknown, options?: T) {
    return fn(
      { utils, matchers, types: utils.types, m: matchers, t: utils.types },
      options,
    )
  }
}
