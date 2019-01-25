import * as Babel from '@babel/core';
import { NodePath } from '@babel/traverse';
import { PluginObj } from '../../../src/BabelPluginTypes';
import { TSAnyKeyword } from '@babel/types';

export default function(babel: typeof Babel): PluginObj {
  const { types: t } = babel;

  return {
    visitor: {
      TSAnyKeyword(path: NodePath<TSAnyKeyword>) {
        path.replaceWith(t.tsObjectKeyword());
      }
    }
  };
}
