import { NodePath } from '@babel/core'
import * as t from '@babel/types'
import * as m from '../matchers'

export type CapturedNodePaths<C> = {
  [K in keyof C]: C[K] extends t.Node ? NodePath<C[K]> : C[K]
}
export type CapturedMatchers<C> = { [K in keyof C]: m.CapturedMatcher<C[K]> }

/**
 * This helper makes it easier to use a matcher that captures `NodePath` values.
 * Here is an example codemod that removes a redundant `-1` argument on `slice`
 * calls:
 *
 * @example
 *
 * import * as m from '@codemod/matchers';
 * import { PluginObj } from '@babel/core';
 *
 * const negativeOneArgument = m.capture(m.numericLiteral(-1));
 * const sliceCallMatcher = m.callExpression(
 *   m.memberExpression(
 *     m.anyExpression(),
 *     m.identifier('slice'),
 *     false
 *   ),
 *   [m.anything(), negativeOneArgument]
 * );
 *
 * export default function(): PluginObj {
 *   return {
 *     CallExpression(path: NodePath<t.CallExpression>): void {
 *       m.matchPath(sliceCallMatcher, { negativeOneArgument }, path ({ negativeOneArgument }) => {
 *         negativeOneArgument.remove();
 *       });
 *     }
 *   };
 * }
 */
export function matchPath<Node extends t.Node, C extends m.CaptureBase>(
  matcher: m.Matcher<Node>,
  captures: CapturedMatchers<C>,
  value: NodePath<Node>,
  callback: (paths: CapturedNodePaths<C>) => void
): void
export function matchPath<Node extends t.Node, C extends m.CaptureBase>(
  matcher: m.Matcher<Array<Node>>,
  captures: CapturedMatchers<C>,
  value: Array<NodePath<Node>>,
  callback: (paths: CapturedNodePaths<C>) => void
): void
export function matchPath<Node extends t.Node, C extends m.CaptureBase>(
  matcher: m.Matcher<Node | Array<Node>>,
  captures: CapturedMatchers<C>,
  value: NodePath<Node> | Array<NodePath<Node>>,
  callback: (paths: CapturedNodePaths<C>) => void
): void {
  const toMatch = Array.isArray(value)
    ? value.map((element) => element.node)
    : value.node
  if (matcher.match(toMatch)) {
    const capturedPaths = {} as CapturedNodePaths<C>

    for (const key in captures) {
      if (Object.prototype.hasOwnProperty.call(captures, key)) {
        const { current, currentKeys } = captures[key as keyof C]
        if (current !== undefined && currentKeys !== undefined) {
          capturedPaths[key as keyof C] = extractCapturedPath(
            value,
            currentKeys
          )
        }
      }
    }

    callback(capturedPaths)
  }
}

function extractCapturedPath<C extends m.CaptureBase>(
  value: NodePath<t.Node> | Array<NodePath<t.Node>>,
  keys: ReadonlyArray<PropertyKey>
): C[keyof C] extends t.Node ? NodePath<C[keyof C]> : C[keyof C] {
  let capturedPath: NodePath<t.Node> | Array<NodePath<t.Node>> = value

  for (const [i, key] of keys.entries()) {
    if (typeof key === 'string') {
      if (Array.isArray(capturedPath)) {
        throw new Error(
          `failed to get '${keys.join('.')}'; at '${keys
            .slice(0, i + 1)
            .join('.')}' expected a NodePath but got an array`
        )
      }

      capturedPath = capturedPath.get(key as string)
    } else if (typeof key === 'number') {
      if (!Array.isArray(capturedPath)) {
        throw new Error(
          `failed to get '${keys.join('.')}'; at '${keys
            .slice(0, i + 1)
            .join('.')}' expected an array but got a NodePath`
        )
      }

      capturedPath = capturedPath[key]
    } else {
      throw new Error(
        `failed to get '${keys.join('.')}'; key '${String(
          key
        )}' is neither a string nor a number, not ${typeof key}`
      )
    }
  }

  if (!Array.isArray(capturedPath) && typeof capturedPath.node !== 'object') {
    return capturedPath.node as C[keyof C] extends t.Node
      ? NodePath<C[keyof C]>
      : C[keyof C]
  } else {
    return capturedPath as C[keyof C] extends t.Node
      ? NodePath<C[keyof C]>
      : C[keyof C]
  }
}
