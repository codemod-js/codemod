import Matcher from './Matcher';

export class OneOfMatcher<T> extends Matcher<[T]> {
  constructor(private readonly matcher: Matcher<T>) {
    super();
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is [T] {
    if (!Array.isArray(value)) {
      return false;
    }

    if (value.length !== 1) {
      return false;
    }

    return this.matcher.matchValue(value[0], [...keys, 0]);
  }
}

export default function oneOf<T>(matcher: Matcher<T>): Matcher<[T]> {
  return new OneOfMatcher(matcher);
}
