import * as t from '@babel/types';
import { isNode } from '../NodeTypes';
import Matcher from './Matcher';

export class AnyStatementMatcher extends Matcher<t.Statement> {
  matchValue(value: unknown): value is t.Statement {
    return isNode(value) && t.isStatement(value);
  }
}

export default function anyStatement(): Matcher<t.Statement> {
  return new AnyStatementMatcher();
}
