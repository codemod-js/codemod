import type * as m from '../matchers'

/**
 * This helper makes it easier to use a matcher together with captured values,
 * especially from TypeScript. Essentially, this helper "unwraps" the captured
 * values and passes them to the callback if the matcher matches the value. This
 * prevents users of capturing matchers from needing to check the current
 * captured value before using it.
 *
 * Here is an example codemod that turns e.g. `a + a` into `a * 2`. This
 * is not actually something you'd want to do as `+` is used on more than
 * just numbers, but it is suitable for purposes of illustration.
 *
 * @example
 *
 * import * as m from '@codemod-esm/matchers';
 *
 * let id: m.CapturedMatcher<t.Identifier>;
 * const idPlusIdMatcher = m.binaryExpression(
 *   '+',
 *   (id = m.capture(m.identifier())),
 *   m.fromCapture(id)
 * );
 *
 * export default function() {
 *   return {
 *     BinaryExpression(path: NodePath<t.BinaryExpression>): void {
 *       m.match(idPlusIdMatcher, { id }, path.node, ({ id }) => {
 *         path.replaceWith(t.binaryExpression('*', id, t.numericLiteral(2)));
 *       });
 *     }
 *   };
 * }
 */
export function match<T, C extends m.CaptureBase>(
  matcher: m.Matcher<T>,
  captures: { [K in keyof C]: m.CapturedMatcher<C[K]> },
  value: T,
  callback: (captures: C) => void,
): void {
  if (matcher.match(value)) {
    const capturedValues = {} as C

    for (const key in captures) {
      if (Object.prototype.hasOwnProperty.call(captures, key)) {
        const capturedValue = captures[key as keyof C].current
        if (capturedValue !== undefined) {
          capturedValues[key as keyof C] = capturedValue
        }
      }
    }

    callback(capturedValues)
  }
}
