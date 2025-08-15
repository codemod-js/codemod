import { Matcher } from './Matcher'
import { anything } from './anything'

export class SliceMatcher<T> extends Matcher<T> {
  constructor(
    readonly min: number,
    readonly max: number,
    readonly matcher: Matcher<T>
  ) {
    super()
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is T {
    return this.matcher.matchValue(value, keys)
  }
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
export function zeroOrMore<T>(
  matcher: Matcher<T> = anything()
): SliceMatcher<T> {
  return new SliceMatcher(0, Infinity, matcher)
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
export function oneOrMore<T>(
  matcher: Matcher<T> = anything()
): SliceMatcher<T> {
  return new SliceMatcher(1, Infinity, matcher)
}

/**
 * Options for {@link slice}.
 */
export interface SliceOptions<T> {
  min?: number
  max?: number
  matcher?: Matcher<T>
}

/**
 * Match a slice of an array. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo', 'bar', 'baz']` but not `['foo']` or `['foo', 'bar', 'baz', 'qux']`
 * m.anyList([m.anyString(), m.slice({ min: 1, max: 2 })])
 * ```
 */
export function slice<T>(options: SliceOptions<T>): SliceMatcher<T>

/**
 * Match a slice of an array of the given length. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo', 'bar', 'baz']` but not `['foo']` or `['foo', 'bar', 'baz', 'qux']`
 * m.anyList([m.anyString(), m.slice(2)])
 * ```
 */
export function slice<T>(length: number, matcher?: Matcher<T>): SliceMatcher<T>

/**
 * Match a slice of an array. For use with `anyList`.
 *
 * @example
 *
 * ```ts
 * // matches `['foo', 'bar', 'baz']` but not `['foo']` or `['foo', 'bar', 'baz', 'qux']`
 * m.anyList([m.anyString(), m.slice({ min: 1, max: 2 })])
 * ```
 */
export function slice<T>(
  optionsOrLength: SliceOptions<T> | number,
  matcherOrUndefined?: Matcher<T>
): SliceMatcher<T> {
  let min: number
  let max: number
  let matcher: Matcher<T>

  if (typeof optionsOrLength === 'number') {
    min = optionsOrLength
    max = optionsOrLength
    matcher = matcherOrUndefined ?? anything()
  } else if (
    typeof optionsOrLength === 'object' &&
    typeof matcherOrUndefined === 'undefined'
  ) {
    min = optionsOrLength.min ?? 0
    max = optionsOrLength.max ?? Infinity
    matcher = optionsOrLength.matcher ?? anything()
  } else {
    throw new Error('Invalid arguments')
  }

  return new SliceMatcher(min, max, matcher)
}

/**
 * @deprecated Use `slice` instead.
 */
export function spacer(min = 1, max = min): SliceMatcher<unknown> {
  return new SliceMatcher(min, max, anything())
}
