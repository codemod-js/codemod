import { isNode, t } from '@codemod/utils'
import { Matcher } from './Matcher'

export class AnyStatementMatcher extends Matcher<t.Statement> {
  matchValue(value: unknown): value is t.Statement {
    return isNode(value) && t.isStatement(value)
  }
}

export function anyStatement(): Matcher<t.Statement> {
  return new AnyStatementMatcher()
}
