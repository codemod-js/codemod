import * as t from '@babel/types';
import { parse } from '@babel/parser';
import { NODE_FIELDS } from '../../../NodeTypes';

function fieldsForNodeType(nodeType: string): Set<string> {
  return new Set(['type', ...Object.keys(NODE_FIELDS[nodeType])]);
}

export default function js(code: string): t.File {
  return stripExtras(
    parse(code, {
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true
    })
  );
}

function stripExtras<N extends t.Node>(node: N): N {
  const fieldsToKeep = fieldsForNodeType(node.type);
  const allFields = Object.keys(node);

  for (const field of allFields) {
    // eslint-disable-next-line typescript/no-explicit-any
    const nodeObj = node as any;

    if (!fieldsToKeep.has(field)) {
      delete nodeObj[field];
    } else {
      const children = Array.isArray(nodeObj[field])
        ? nodeObj[field]
        : [nodeObj[field]];

      for (const child of children) {
        if (
          child &&
          typeof child === 'object' &&
          typeof child.type === 'string'
        ) {
          stripExtras(child);
        }
      }
    }
  }

  return node;
}
