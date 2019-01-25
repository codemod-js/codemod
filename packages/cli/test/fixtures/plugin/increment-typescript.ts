import { NodePath } from '@babel/traverse';
import { PluginObj } from '../../../src/BabelPluginTypes';
import * as t from '@babel/types';

enum IncrementValues {
  One = 1,
  Two = 2
}

export default function(): PluginObj {
  return {
    visitor: {
      NumericLiteral(path: NodePath<t.NumericLiteral>) {
        path.node.value += IncrementValues.One;
      }
    }
  };
}
