function union<T>(...sets: Array<Set<T>>): Set<T> {
  return new Set(sets.reduce((result, set) => [...result, ...set], []))
}

export const TypeScriptExtensions = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.mtsx',
  '.cts',
  '.ctsx',
])
export const JavaScriptExtensions = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.mjsx',
  '.cjs',
  '.cjsx',
  '.es',
  '.es6',
])
export const PluginExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
)
export const RequireableExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
)
export const TransformableExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
)
