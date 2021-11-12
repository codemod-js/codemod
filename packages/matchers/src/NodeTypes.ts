import * as t from '@babel/types'
import { Validator } from '../script/_utils/utils'

export interface BuilderKeysByType {
  [key: string]: Array<string>
}

export interface NodeFieldsByType {
  [key: string]: NodeFields
}

export interface NodeFields {
  [key: string]: NodeField
}

export interface NodeField<T = unknown> {
  default: T | null
  optional?: boolean
  validate: Validator
}

export const { BUILDER_KEYS, NODE_FIELDS } = t as unknown as {
  BUILDER_KEYS: BuilderKeysByType
  NODE_FIELDS: NodeFieldsByType
}

export function isNode(value: unknown): value is t.Node {
  return (
    typeof value === 'object' &&
    !!value &&
    'type' in value &&
    (value as { type: string }).type in NODE_FIELDS
  )
}
