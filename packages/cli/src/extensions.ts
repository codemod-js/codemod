function union<T>(...sets: Array<Set<T>>) {
  return new Set(sets.reduce((result, set) => [...result, ...set], []));
}

export const TypeScriptExtensions = new Set(['.ts', '.tsx']);
export const JavaScriptExtensions = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.es',
  '.es6'
]);
export const PluginExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
);
export const RequireableExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
);
export const TransformableExtensions = union(
  TypeScriptExtensions,
  JavaScriptExtensions
);
