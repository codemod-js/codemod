import Matcher from './Matcher'

export class NumberMatcher extends Matcher<number> {
  matchValue(value: unknown): value is number {
    return typeof value === 'number' || value instanceof Number
  }
}

export default function anyNumber(): Matcher<number> {
  return new NumberMatcher()
}
