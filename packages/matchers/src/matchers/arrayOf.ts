import Matcher from './Matcher';

export class ArrayOfMatcher<T> extends Matcher<Array<T>> {
  constructor(private readonly elementMatcher: Matcher<T>) {
    super();
  }

  match(value: unknown): value is Array<T> {
    if (!Array.isArray(value)) {
      return false;
    }

    for (const element of value) {
      if (!this.elementMatcher.match(element)) {
        return false;
      }
    }

    return true;
  }
}

export default function arrayOf<T>(
  elementMatcher: Matcher<T>
): Matcher<Array<T>> {
  return new ArrayOfMatcher(elementMatcher);
}
