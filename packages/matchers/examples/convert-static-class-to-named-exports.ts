/**
 * Converts default-exported class with all static methods to named exports.
 *
 * @example
 *
 * class MobileAppUpsellHelper {
 *   static getIosAppLink(specialTrackingLink) {
 *     const trackingLink = specialTrackingLink || 'IOS_BRANCH_LINK';
 *     return this.getBranchLink(trackingLink);
 *   }
 *
 *   static getAndroidAppLink(specialTrackingLink) {
 *     const trackingLink = specialTrackingLink || 'ANDROID_BRANCH_LINK';
 *     return this.getBranchLink(trackingLink);
 *   }
 *
 *   static getBranchLink(specialTrackingLink) {
 *     if (specialTrackingLink && APP_DOWNLOAD_ASSETS[specialTrackingLink]) {
 *       return APP_DOWNLOAD_ASSETS[specialTrackingLink];
 *     }
 *
 *     return APP_DOWNLOAD_ASSETS.DEFAULT_BRANCH_LINK;
 *   }
 *
 *   static getHideAppBanner() {
 *     return CookieHelper.get('hide_app_banner');
 *   }
 * }
 *
 * export default MobileAppUpsellHelper;
 *
 * // becomes
 *
 * export function getIosAppLink(specialTrackingLink) {
 *   const trackingLink = specialTrackingLink || 'IOS_BRANCH_LINK';
 *   return getBranchLink(trackingLink);
 * }
 *
 * export function getAndroidAppLink(specialTrackingLink) {
 *   const trackingLink = specialTrackingLink || 'ANDROID_BRANCH_LINK';
 *   return getBranchLink(trackingLink);
 * }
 *
 * export function getBranchLink(specialTrackingLink) {
 *   if (specialTrackingLink && APP_DOWNLOAD_ASSETS[specialTrackingLink]) {
 *     return APP_DOWNLOAD_ASSETS[specialTrackingLink];
 *   }
 *
 *   return APP_DOWNLOAD_ASSETS.DEFAULT_BRANCH_LINK;
 * }
 *
 * export function getHideAppBanner() {
 *   return CookieHelper.get('hide_app_banner');
 * }
 */

import { PluginObj } from '@babel/core'
import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import * as m from '../src'

// capture the name of the exported class
const className = m.capture(m.anyString())

// capture the class declaration
const classDeclaration = m.capture(
  m.classDeclaration(
    m.identifier(className),
    undefined,
    m.classBody(
      m.arrayOf(
        m.classMethod(
          'method',
          m.identifier(),
          m.anything(),
          m.anything(),
          false,
          true
        )
      )
    )
  )
)

// capture the export, making sure to match the class name
const exportDeclaration = m.capture(
  m.exportDefaultDeclaration(m.identifier(m.fromCapture(className)))
)

// match a program that contains a matching class and export declaration
const matcher = m.program(
  m.anyList<t.Statement>(
    m.zeroOrMore(),
    classDeclaration,
    m.zeroOrMore(),
    exportDeclaration,
    m.zeroOrMore()
  )
)

// match `this.*`, used internally
const thisPropertyAccessMatcher = m.memberExpression(
  m.thisExpression(),
  m.identifier(),
  false
)

export default function (): PluginObj {
  return {
    visitor: {
      Program(path: NodePath<t.Program>): void {
        m.matchPath(
          matcher,
          { exportDeclaration, classDeclaration },
          path,
          ({ exportDeclaration, classDeclaration }) => {
            const replacements: Array<t.Statement> = []
            const classBody = classDeclaration.get('body') as NodePath<
              t.ClassBody
            >

            for (const property of classBody.get('body')) {
              if (!property.isClassMethod()) {
                throw new Error(
                  `unexpected ${property.type} while looking for ClassMethod`
                )
              }

              if (!t.isIdentifier(property.node.key)) {
                throw new Error(
                  `unexpected ${
                    property.get('key').type
                  } while looking for Identifier`
                )
              }

              replacements.push(
                t.exportNamedDeclaration(
                  t.functionDeclaration(
                    property.node.key,
                    property.node.params,
                    property.node.body,
                    property.node.generator,
                    property.node.async
                  ),
                  []
                )
              )

              property.get('body').traverse({
                enter(path: NodePath<t.Node>): void {
                  if (path.isFunction()) {
                    if (!path.isArrowFunctionExpression()) {
                      path.skip()
                    }
                  } else if (
                    path.isMemberExpression() &&
                    thisPropertyAccessMatcher.match(path.node)
                  ) {
                    path.replaceWith(path.node.property)
                  }
                },
              })
            }

            exportDeclaration.remove()
            classDeclaration.replaceWithMultiple(replacements)
          }
        )
      },
    },
  }
}
