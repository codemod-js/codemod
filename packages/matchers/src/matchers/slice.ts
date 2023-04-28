export class SliceMatcher {
  constructor(readonly min: number, readonly max: number) {}
}

/**
 * Match zero or more elements. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo', 1]` and `['foo', 'bar', 2]` and `['foo', 'bar', 'baz', 3]` but not `['foo']` or `['foo', 'bar']`
 * m.anyList([m.anyString(), m.zeroOrMore(), m.anyNumber()])
 * ```
 */
export function zeroOrMore(): SliceMatcher {
  return new SliceMatcher(0, Infinity)
}

/**
 * Match one or more elements. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo']` and `['foo', 'bar']` but not `[]`
 * m.anyList([m.oneOrMore()])
 * ```
 */
export function oneOrMore(): SliceMatcher {
  return new SliceMatcher(1, Infinity)
}

/**
 * Match a slice of an array. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo', 'bar', 'baz']` but not `['foo']` or `['foo', 'bar', 'baz', 'qux']`
 * m.anyList([m.anyString(), m.slice(1, 2)])
 * ```
 */
export function slice(min: number, max = min): SliceMatcher {
  return new SliceMatcher(min, max)
}

/**
 * @deprecated Use `slice` instead.
 */
export function spacer(min = 1, max = min): SliceMatcher {
  return new SliceMatcher(min, max)
}
