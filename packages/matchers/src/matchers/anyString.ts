import Matcher from './Matcher';

export class StringMatcher extends Matcher<string> {
  match(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String;
  }
}

export default function anyString(): Matcher<string> {
  return new StringMatcher();
}
