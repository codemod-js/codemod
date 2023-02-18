import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { parse } from '@codemod/parser'

export type Replacement =
  | t.Statement
  | t.Expression
  | Array<t.Statement>
  | Array<t.Expression>

export interface ReplacementsBase {
  [key: string]: Replacement
}

export function program<R extends ReplacementsBase>(
  template: string
): (replacements?: R) => t.File {
  const ast = parse(template)

  return (replacements = {} as R) => {
    const unusedReplacements = new Set(Object.keys(replacements))

    traverse(ast, {
      Placeholder(path: NodePath<t.Placeholder>): void {
        const name = path.node.name.name
        const replacement = replacements[name]

        if (!replacement) {
          throw new Error(
            `no replacement found for placeholder with name: ${name}`
          )
        }

        if (Array.isArray(replacement)) {
          path.replaceWithMultiple(replacement)
        } else {
          path.replaceWith(replacement)
        }

        unusedReplacements.delete(name)
      },
    })

    if (unusedReplacements.size > 0) {
      const names = Array.from(unusedReplacements).join(', ')

      throw new Error(`template replacements were not used: ${names}`)
    }

    return ast
  }
}

export function statement<R extends ReplacementsBase>(
  template: string
): (replacements?: R) => t.Statement {
  const builder = program(template)
  return (replacements) =>
    getSingleStatement(builder(replacements).program.body)
}

export function expression<R extends ReplacementsBase>(
  template: string
): (replacements?: R) => t.Expression {
  const builder = program(template)
  return (replacements) =>
    getSingleExpression(builder(replacements).program.body)
}

function getSingleStatement(statements: Array<t.Statement>): t.Statement {
  if (statements.length !== 1) {
    throw new TypeError(
      `expected a single statement but ${statements.length} statements`
    )
  }

  return statements[0]
}

function getSingleExpression(statements: Array<t.Statement>): t.Expression {
  if (statements.length !== 1) {
    throw new TypeError(
      `expected a single expression but ${statements.length} statements`
    )
  }

  const statement = statements[0]

  if (!t.isExpressionStatement(statement)) {
    throw new TypeError(
      `expected a single expression but got a single ${statement.type}`
    )
  }

  return statement.expression
}
