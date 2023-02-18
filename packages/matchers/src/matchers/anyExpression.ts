import { isNode, t } from '@codemod/utils'
import { Matcher } from './Matcher'

export class AnyExpressionMatcher extends Matcher<t.Expression> {
  matchValue(value: unknown): value is t.Expression {
    return isNode(value) && t.isExpression(value)
  }
}

export function anyExpression(): Matcher<t.Expression> {
  return new AnyExpressionMatcher()
}
