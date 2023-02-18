import * as t from '@babel/types'

export interface ArrayValidator {
  each: Validator
}

export interface ChainOfValidator {
  chainOf: Array<Validator>
}

export interface OneOfValidator {
  oneOf: Array<string | boolean | number>
}

export interface OneOfNodeTypesValidator {
  oneOfNodeTypes: Array<string>
}

export interface OneOfNodeOrValueTypesValidator {
  oneOfNodeOrValueTypes: Array<string>
}

export interface Type {
  type: string
}

export type Validator =
  | ArrayValidator
  | ChainOfValidator
  | OneOfValidator
  | OneOfNodeTypesValidator
  | OneOfNodeOrValueTypesValidator
  | Type

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
