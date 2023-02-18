import { isNode, t } from '@codemod/utils'
import { Matcher } from './Matcher'

export class AnyNodeMatcher extends Matcher<t.Node> {
  matchValue(value: unknown): value is t.Node {
    return isNode(value)
  }
}

export function anyNode(): Matcher<t.Node> {
  return new AnyNodeMatcher()
}
