import { NodePath } from '@babel/traverse';

enum IncrementValues {
  One = 1,
  Two = 2
}

export default function() {
  return {
    visitor: {
      NumericLiteral(path: NodePath) {
        path.node.value += IncrementValues.One;
      }
    }
  };
}
