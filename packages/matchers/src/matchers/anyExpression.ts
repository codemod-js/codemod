import * as t from '@babel/types'
import { Matcher } from './Matcher'

export class AnyExpressionMatcher extends Matcher<t.Expression> {
  matchValue(value: unknown): value is t.Expression {
    return t.isNode(value) && t.isExpression(value)
  }
}

export function anyExpression(): Matcher<t.Expression> {
  return new AnyExpressionMatcher()
}
