import { distributeAcrossSpacers } from '../utils/distributeAcrossSpacers'
import { Matcher } from './Matcher'
import { Spacer } from './spacers'

export class AnyListMatcher<T> extends Matcher<Array<T>> {
  private readonly spacers: Array<Spacer> = []

  constructor(private readonly elements: Array<Matcher<T> | Spacer>) {
    super()

    for (const element of elements) {
      if (element instanceof Spacer) {
        this.spacers.push(element)
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

    if (this.elements.length === 0 && array.length === 0) {
      return true
    }

    const spacerAllocations = distributeAcrossSpacers(
      this.spacers,
      array.length - this.elements.length + this.spacers.length
    )

    for (const allocations of spacerAllocations) {
      const toMatch: Array<T> = array.slice()
      let matchedAll = true
      let key = 0

      for (const element of this.elements) {
        if (element instanceof Spacer) {
          let spacesForSpacer = allocations.shift() || 0

          while (spacesForSpacer > 0) {
            toMatch.shift()
            spacesForSpacer--
            key++
          }
        } else if (!element.matchValue(toMatch.shift(), [...keys, key])) {
          matchedAll = false
          break
        } else {
          key++
        }
      }

      if (matchedAll) {
        if (toMatch.length > 0) {
          throw new Error(
            `expected to consume all elements to match but ${toMatch.length} remain!`
          )
        }

        return true
      }
    }

    return false
  }
}

export function anyList<T>(
  ...elements: Array<Matcher<T> | Spacer>
): Matcher<Array<T>> {
  return new AnyListMatcher(elements)
}
