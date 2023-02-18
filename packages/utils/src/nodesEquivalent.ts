import * as t from '@babel/types'
import { NODE_FIELDS } from './NodeTypes'

/**
 * Determines whether two `@babel/types` nodes are equivalent.
 */
export function nodesEquivalent(a: t.Node, b: t.Node): boolean {
  if (a === b) {
    return true
  }

  if (a.type !== b.type) {
    return false
  }

  const fields = NODE_FIELDS[a.type]
  const aProps = a as unknown as { [key: string]: unknown }
  const bProps = b as unknown as { [key: string]: unknown }

  for (const [k, field] of Object.entries(fields)) {
    const key = k as keyof typeof fields

    if (field.optional && aProps[key] == null && bProps[key] == null) {
      continue
    }

    const aVal = aProps[key]
    const bVal = bProps[key]

    if (aVal === bVal) {
      continue
    }

    if (aVal == null || bVal == null) {
      return false
    }

    if (Array.isArray(aVal) && Array.isArray(bVal)) {
      if (aVal.length !== bVal.length) {
        return false
      }

      for (let i = 0; i < aVal.length; i++) {
        if (!nodesEquivalent(aVal[i], bVal[i])) {
          return false
        }
      }

      continue
    }

    if (t.isNode(aVal) && t.isNode(bVal)) {
      if (!nodesEquivalent(aVal, bVal)) {
        return false
      }

      continue
    }

    return false
  }

  return true
}
