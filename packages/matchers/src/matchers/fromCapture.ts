import { CapturedMatcher } from '../matchers'
import { isNode } from '../NodeTypes'
import { nodesEquivalent } from '../utils/nodesEquivalent'
import Matcher from './Matcher'

export class FromCaptureMatcher<T> extends Matcher<T> {
  constructor(private readonly capturedMatcher: CapturedMatcher<T>) {
    super()
  }

  matchValue(value: unknown): value is T {
    if (isNode(this.capturedMatcher.current) && isNode(value)) {
      return nodesEquivalent(this.capturedMatcher.current, value)
    }
    return this.capturedMatcher.current === value
  }
}

/**
 * Matches the value captured by `capturedMatcher`, which must match its value
 * before this matcher. That is, `capturedMatcher` must match a value that is
 * visited before this matcher. If `capturedMatcher` matches a node, this
 * matcher will match a node that is equivalent–but not necessarily identical–to
 * the captured node.
 */
export default function fromCapture<T>(
  capturedMatcher: CapturedMatcher<T>
): Matcher<T> {
  return new FromCaptureMatcher(capturedMatcher)
}
