import { nodesEquivalent, t } from '@codemod/utils'
import { CapturedMatcher } from './capture'
import { Matcher } from './Matcher'

export class FromCaptureMatcher<T> extends Matcher<T> {
  constructor(private readonly capturedMatcher: CapturedMatcher<T>) {
    super()
  }

  matchValue(value: unknown): value is T {
    if (t.isNode(this.capturedMatcher.current) && t.isNode(value)) {
      return nodesEquivalent(this.capturedMatcher.current, value)
    }
    return this.capturedMatcher.current === value
  }
}

export function fromCapture<T>(
  capturedMatcher: CapturedMatcher<T>,
): Matcher<T> {
  return new FromCaptureMatcher(capturedMatcher)
}
