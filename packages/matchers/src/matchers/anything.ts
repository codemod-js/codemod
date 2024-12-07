import { Matcher } from './Matcher'

export class AnythingMatcher<T> extends Matcher<T> {
  matchValue(value: unknown): value is T {
    return true
  }
}

export function anything<T>(): Matcher<T> {
  return new AnythingMatcher()
}
