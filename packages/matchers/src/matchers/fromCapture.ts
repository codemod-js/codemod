import { CapturedMatcher } from '../matchers'
import Matcher from './Matcher'

export class FromCaptureMatcher<T> extends Matcher<T> {
  constructor(private readonly capturedMatcher: CapturedMatcher<T>) {
    super()
  }

  matchValue(value: unknown): value is T {
    return this.capturedMatcher.current === value
  }
}

export default function fromCapture<T>(
  capturedMatcher: CapturedMatcher<T>
): Matcher<T> {
  return new FromCaptureMatcher(capturedMatcher)
}
