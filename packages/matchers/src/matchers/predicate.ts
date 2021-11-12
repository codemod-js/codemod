import { Matcher } from '../matchers'

export type Predicate = (value: unknown) => boolean

export class PredicateMatcher<T> extends Matcher<T> {
  constructor(private readonly predicate: Predicate) {
    super()
  }

  matchValue(value: unknown): value is T {
    return this.predicate(value)
  }
}

export default function predicate<T>(predicate: Predicate): Matcher<T> {
  return new PredicateMatcher(predicate)
}
