/**
 * Resolvers locate plugin paths given a source string.
 */
export default interface Resolver {
  /**
   * Determines whether the source can be resolved by this resolver. This should
   * not necessarily determine whether the source actually does resolve to
   * anything, but rather whether it is of the right form to be resolved.
   *
   * For example, if a resolver were written to load a plugin from a `data:` URI
   * then this method might simply check that the URI is a valid `data:` URI
   * rather than actually decoding and handling the contents of said URI.
   */
  canResolve(source: string): Promise<boolean>;

  /**
   * Determines a file path that, when loaded as JavaScript, exports a babel
   * plugin suitable for use in the transform pipeline. If `source` does not
   * actually resolve to a file already on disk, consider writing the contents
   * to disk in a temporary location.
   */
  resolve(source: string): Promise<string>;
}
