import { Matcher } from './Matcher'

export class ArrayOfMatcher<T> extends Matcher<Array<T>> {
  constructor(private readonly elementMatcher: Matcher<T>) {
    super()
  }

  matchValue(
    value: unknown,
    keys: ReadonlyArray<PropertyKey>,
  ): value is Array<T> {
    if (!Array.isArray(value)) {
      return false
    }

    for (const [i, element] of value.entries()) {
      if (!this.elementMatcher.matchValue(element, [...keys, i])) {
        return false
      }
    }

    return true
  }
}

export function arrayOf<T>(elementMatcher: Matcher<T>): Matcher<Array<T>> {
  return new ArrayOfMatcher(elementMatcher)
}
