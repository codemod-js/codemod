import { distributeAcrossSlices } from '../utils/distributeAcrossSlices'
import { Matcher } from './Matcher'
import { SliceMatcher } from './slice'

export class AnyListMatcher<T> extends Matcher<Array<T>> {
  private readonly sliceMatchers: Array<SliceMatcher<T>> = []

  constructor(private readonly matchers: Array<Matcher<T>>) {
    super()

    for (const matcher of matchers) {
      if (matcher instanceof SliceMatcher) {
        this.sliceMatchers.push(matcher)
      }
    }
  }

  matchValue(
    array: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): array is Array<T> {
    if (!Array.isArray(array)) {
      return false
    }

    if (this.matchers.length === 0 && array.length === 0) {
      return true
    }

    const spacerAllocations = distributeAcrossSlices(
      this.sliceMatchers,
      array.length - this.matchers.length + this.sliceMatchers.length
    )

    for (const allocations of spacerAllocations) {
      const valuesToMatch: Array<T> = array.slice()
      let matchedAll = true
      let key = 0

      for (const matcher of this.matchers) {
        if (matcher instanceof SliceMatcher) {
          let sliceValueCount = allocations.shift() || 0

          while (sliceValueCount > 0) {
            const valueToMatch = valuesToMatch.shift()
            if (!matcher.matchValue(valueToMatch, [...keys, key])) {
              matchedAll = false
              break
            }
            sliceValueCount--
            key++
          }
        } else if (!matcher.matchValue(valuesToMatch.shift(), [...keys, key])) {
          matchedAll = false
          break
        } else {
          key++
        }
      }

      if (matchedAll) {
        if (valuesToMatch.length > 0) {
          throw new Error(
            `expected to consume all elements to match but ${valuesToMatch.length} remain!`
          )
        }

        return true
      }
    }

    return false
  }
}

export function anyList<T>(...elements: Array<Matcher<T>>): Matcher<Array<T>> {
  return new AnyListMatcher(elements)
}
