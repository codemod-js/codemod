import * as t from '@babel/types'
import { Matcher } from './Matcher'
import { CapturedMatcher } from './capture'

/**
 * Matches and captures using another matcher by recursively checking all
 * descendants of a given node. The matched descendant is captured as the
 * current value of this capturing matcher.
 */
export class ContainerOfMatcher<
  C extends t.Node,
  M extends t.Node = C,
> extends CapturedMatcher<C, M> {
  constructor(private readonly containedMatcher: Matcher<C>) {
    super()
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is M {
    if (!t.isNode(value)) {
      return false
    }

    if (this.containedMatcher.matchValue(value, keys)) {
      this.capture(value, keys)
      return true
    }

    for (const key in value) {
      const valueAtKey = value[key as keyof typeof value]
      if (Array.isArray(valueAtKey)) {
        for (const [i, element] of valueAtKey.entries()) {
          if (this.matchValue(element, [...keys, key, i])) {
            return true
          }
        }
      } else if (this.matchValue(valueAtKey, [...keys, key])) {
        return true
      }
    }

    return false
  }
}

export function containerOf<C extends t.Node, M extends t.Node = C>(
  containedMatcher: Matcher<C>,
): ContainerOfMatcher<C, M> {
  return new ContainerOfMatcher(containedMatcher)
}
