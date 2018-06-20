import * as Babel from '@babel/core';
import { NodePath } from '@babel/traverse';

export default function(babel: typeof Babel) {
  const { types: t } = babel;

  return {
    visitor: {
      TSAnyKeyword(path: NodePath) {
        path.replaceWith(t.tsObjectKeyword());
      }
    }
  };
}
