import * as t from '@babel/types'
import tupleOf from './tupleOf'
import { isNode } from '../NodeTypes'
import Matcher from './Matcher'

export class FunctionMatcher extends Matcher<t.Function> {
  constructor(
    private readonly params?: Matcher<Array<t.LVal>> | Array<Matcher<t.LVal>>,
    private readonly body?: Matcher<t.Expression | t.BlockStatement>
  ) {
    super()
  }

  matchValue(
    value: unknown,
    keys: ReadonlyArray<PropertyKey>
  ): value is t.Function {
    if (!isNode(value) || !t.isFunction(value)) {
      return false
    }

    if (this.params) {
      if (Array.isArray(this.params)) {
        if (
          !tupleOf(...this.params).matchValue(value.params, [...keys, 'params'])
        ) {
          return false
        }
      } else if (!this.params.matchValue(value.params, [...keys, 'params'])) {
        return false
      }
    }

    if (this.body && !this.body.matchValue(value.body, [...keys, 'body'])) {
      return false
    }

    return true
  }
}

export default function Function(
  params?: Matcher<Array<t.LVal>> | Array<Matcher<t.LVal>>,
  body?: Matcher<t.Expression | t.BlockStatement>
): Matcher<t.Function> {
  return new FunctionMatcher(params, body)
}
