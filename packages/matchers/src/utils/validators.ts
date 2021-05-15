import * as t from '@babel/types'
import generate from '@babel/generator'

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

export function isValidatorOfType(
  type: string,
  validator: Validator | undefined
): boolean {
  if (!validator) {
    return false
  }

  if ('chainOf' in validator) {
    return validator.chainOf.some((child) => isValidatorOfType(type, child))
  }

  if ('oneOf' in validator) {
    return validator.oneOf.some((child) => typeof child === type)
  }

  return 'type' in validator && validator.type === type
}

export function typeFromName(name: string): t.TSType {
  switch (name) {
    case 'string':
      return t.tsStringKeyword()
    case 'number':
      return t.tsNumberKeyword()
    case 'boolean':
      return t.tsBooleanKeyword()
    case 'null':
      return t.tsNullKeyword()
    case 'undefined':
      return t.tsUndefinedKeyword()
    case 'any':
      return t.tsAnyKeyword()
    default:
      return t.tsTypeReference(t.identifier(name))
  }
}

export function typeForValidator(validator?: Validator): t.TSType {
  if (!validator) {
    return t.tsAnyKeyword()
  }

  if ('each' in validator) {
    return t.tsArrayType(typeForValidator(validator.each))
  }

  if ('chainOf' in validator) {
    return typeForValidator(validator.chainOf[1])
  }

  if ('oneOf' in validator) {
    return t.tsUnionType(
      validator.oneOf.map((type) => {
        if (typeof type === 'string') {
          return t.tsLiteralType(t.stringLiteral(type))
        } else if (typeof type === 'boolean') {
          return t.tsLiteralType(t.booleanLiteral(type))
        } else if (typeof type === 'number') {
          return t.tsLiteralType(t.numericLiteral(type))
        } else {
          throw new Error(`unexpected 'oneOf' value: ${type}`)
        }
      })
    )
  }

  if ('oneOfNodeTypes' in validator) {
    return t.tsUnionType(
      validator.oneOfNodeTypes.map((type) =>
        t.tsTypeReference(t.identifier(type))
      )
    )
  }

  if ('oneOfNodeOrValueTypes' in validator) {
    return t.tsUnionType(validator.oneOfNodeOrValueTypes.map(typeFromName))
  }

  if (validator.type) {
    return typeFromName(validator.type)
  }

  return t.tsAnyKeyword()
}

function stringifyQualifiedName(type: t.TSQualifiedName): string {
  if (t.isIdentifier(type.left)) {
    return `${type.left.name}.${type.right.name}`
  } else {
    return `${stringifyQualifiedName(type.left)}.${type.right.name}`
  }
}

export function stringifyType(
  type: t.TSType,
  replacer?: (type: t.TSType, value: string) => string | undefined
): string {
  function withReplacer(value: string): string {
    return (replacer && replacer(type, value)) || value
  }

  if (t.isTSUnionType(type)) {
    return withReplacer(
      type.types.map((child) => stringifyType(child, replacer)).join(' | ')
    )
  } else if (t.isTSAnyKeyword(type)) {
    return withReplacer('any')
  } else if (t.isTSNumberKeyword(type)) {
    return withReplacer('number')
  } else if (t.isTSStringKeyword(type)) {
    return withReplacer('string')
  } else if (t.isTSUndefinedKeyword(type)) {
    return withReplacer('undefined')
  } else if (t.isTSTypeReference(type)) {
    if (t.isIdentifier(type.typeName)) {
      return withReplacer(type.typeName.name)
    } else {
      return withReplacer(stringifyQualifiedName(type.typeName))
    }
  } else if (t.isTSArrayType(type)) {
    return withReplacer(`Array<${stringifyType(type.elementType, replacer)}>`)
  } else {
    return withReplacer(generate(type).code)
  }
}

export function stringifyValidator(
  validator: Validator | undefined,
  nodePrefix: string,
  nodeSuffix: string
): string {
  return stringifyType(typeForValidator(validator), (type, value) => {
    if (t.isTSTypeReference(type)) {
      return nodePrefix + value + nodeSuffix
    } else {
      return value
    }
  })
}

export function toFunctionName(typeName: string): string {
  const _ = typeName.replace(/^TS/, 'ts').replace(/^JSX/, 'jsx')
  return _.slice(0, 1).toLowerCase() + _.slice(1)
}
