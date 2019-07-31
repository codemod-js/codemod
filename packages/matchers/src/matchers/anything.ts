import Matcher from './Matcher';

export class AnythingMatcher<T> extends Matcher<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  matchValue(value: unknown): value is T {
    return true;
  }
}

export default function anything<T>(): Matcher<T> {
  return new AnythingMatcher();
}
