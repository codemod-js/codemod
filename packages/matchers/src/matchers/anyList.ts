import { Spacer } from '../matchers';
import distributeAcrossSpacers from '../utils/distributeAcrossSpacers';
import Matcher from './Matcher';

export class AnyListMatcher<T> extends Matcher<Array<T>> {
  private readonly spacers: Array<Spacer> = [];

  constructor(private readonly elements: Array<Matcher<T> | Spacer>) {
    super();

    for (const element of elements) {
      if (element instanceof Spacer) {
        this.spacers.push(element);
      }
    }
  }

  match(array: unknown): array is Array<T> {
    if (!Array.isArray(array)) {
      return false;
    }

    if (this.elements.length === 0 && array.length === 0) {
      return true;
    }

    const spacerAllocations = distributeAcrossSpacers(
      this.spacers,
      array.length - this.elements.length + this.spacers.length
    );

    for (const allocations of spacerAllocations) {
      const toMatch: Array<T> = array.slice();
      let matchedAll = true;

      for (const element of this.elements) {
        if (element instanceof Spacer) {
          let spacesForSpacer = allocations.shift() || 0;

          while (spacesForSpacer > 0) {
            toMatch.shift();
            spacesForSpacer--;
          }
        } else if (!element.match(toMatch.shift())) {
          matchedAll = false;
          break;
        }
      }

      if (matchedAll) {
        if (toMatch.length > 0) {
          throw new Error(
            `expected to consume all elements to match but ${
              toMatch.length
            } remain!`
          );
        }

        return true;
      }
    }

    return false;
  }
}

export default function anyList<T>(
  ...elements: Array<Matcher<T> | Spacer>
): Matcher<Array<T>> {
  return new AnyListMatcher(elements);
}
