import Matcher from './Matcher';

export class OrMatcher<T, A extends Array<Matcher<T> | T>> extends Matcher<T> {
  private readonly matchersOrValues: A;

  constructor(...matchersOrValues: A) {
    super();
    this.matchersOrValues = matchersOrValues;
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is T {
    for (const matcherOrValue of this.matchersOrValues) {
      if (matcherOrValue instanceof Matcher) {
        if (matcherOrValue.matchValue(value, keys)) {
          return true;
        }
      } else if (matcherOrValue === value) {
        return true;
      }
    }
    return false;
  }
}

export default function or<T>(): Matcher<T>;
export default function or<T>(first: Matcher<T> | T): Matcher<T>;
export default function or<T, U>(
  first: Matcher<T> | T,
  second: Matcher<U> | U
): Matcher<T | U>;
export default function or<T, U, V>(
  first: Matcher<T> | T,
  second: Matcher<U> | U,
  third: Matcher<V> | V
): Matcher<T | U | V>;
export default function or<T, U, V, W>(
  first: Matcher<T> | T,
  second: Matcher<U> | U,
  third: Matcher<V> | V,
  fourth: Matcher<W> | W
): Matcher<T | U | V | W>;
export default function or<T, U, V, W, X>(
  first: Matcher<T> | T,
  second: Matcher<U> | U,
  third: Matcher<V> | V,
  fourth: Matcher<W> | W,
  fifth: Matcher<X> | X
): Matcher<T | U | V | W | X>;
export default function or<T, A extends Array<Matcher<T> | T>>(
  ...matchersOrValues: A
): Matcher<T> {
  return new OrMatcher(...matchersOrValues);
}
