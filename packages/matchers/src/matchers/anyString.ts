import { Matcher } from './Matcher'

export class StringMatcher extends Matcher<string> {
  matchValue(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String
  }
}

export function anyString(): Matcher<string> {
  return new StringMatcher()
}
