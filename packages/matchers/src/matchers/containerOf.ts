import * as t from '@babel/types';
import { Matcher } from '../matchers';
import { CapturedMatcher } from './capture';
import { isNode } from '../NodeTypes';

/**
 * Matches and captures using another matcher by recursively checking all
 * descendants of a given node. The matched descendant is captured as the
 * current value of this capturing matcher.
 */
export class ContainerOfMatcher<T extends t.Node> extends CapturedMatcher<T> {
  constructor(private readonly containedMatcher: Matcher<T>) {
    super();
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is T {
    if (!isNode(value)) {
      return false;
    }

    if (this.containedMatcher.matchValue(value, keys)) {
      this.capture(value, keys);
      return true;
    }

    for (const key in value) {
      const valueAtKey = value[key as keyof typeof value];
      if (Array.isArray(valueAtKey)) {
        for (const [i, element] of valueAtKey.entries()) {
          if (this.matchValue(element, [...keys, key, i])) {
            return true;
          }
        }
      } else if (this.matchValue(valueAtKey, [...keys, key])) {
        return true;
      }
    }

    return false;
  }
}

export default function containerOf<T extends t.Node>(
  containedMatcher: Matcher<T>
): CapturedMatcher<T> {
  return new ContainerOfMatcher(containedMatcher);
}
