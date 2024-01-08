import { Matcher } from './Matcher'

export class TupleOfMatcher<
  T,
  A extends Array<T> = Array<T>,
> extends Matcher<A> {
  private readonly matchers: Array<Matcher<T>>

  constructor(...matchers: Array<Matcher<T>>) {
    super()
    this.matchers = matchers
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is A {
    if (!Array.isArray(value)) {
      return false
    }

    if (value.length !== this.matchers.length) {
      return false
    }

    for (let i = 0; i < this.matchers.length; i++) {
      const matcher = this.matchers[i]
      const element = value[i]

      if (!matcher.matchValue(element, [...keys, i])) {
        return false
      }
    }

    return true
  }
}

export function tupleOf<T, A extends Array<T> = Array<T>>(
  ...matchers: Array<Matcher<T>>
): Matcher<A> {
  return new TupleOfMatcher(...matchers)
}
