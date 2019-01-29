import { isNode } from '../NodeTypes';
import * as t from '@babel/types';
import Matcher from './Matcher';

export class AnyExpressionMatcher extends Matcher<t.Expression> {
  matchValue(value: unknown): value is t.Expression {
    return isNode(value) && t.isExpression(value);
  }
}

export default function anyExpression(): Matcher<t.Expression> {
  return new AnyExpressionMatcher();
}
