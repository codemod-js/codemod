import { PluginObj, NodePath } from '@babel/core'
import * as t from '@babel/types'

export default function <T>(_: unknown, options: T): PluginObj {
  return {
    visitor: {
      Program(path: NodePath<t.Program>): void {
        path.node.body.push(
          t.expressionStatement(t.stringLiteral(JSON.stringify(options)))
        )
      },
    },
  }
}
