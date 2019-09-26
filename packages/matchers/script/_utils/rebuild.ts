#!/usr/bin/env ts-node

import * as t from '@babel/types';
import { join } from 'path';
import {
  stringifyValidator,
  isValidatorOfType,
  toFunctionName,
  typeForValidator,
  stringifyType
} from './utils';
import dedent = require('dedent');
import { NodeField, BUILDER_KEYS, NODE_FIELDS } from '../../src/NodeTypes';
import format from './format';

export const MATCHERS_FILE_PATH = join(__dirname, '../../src/matchers.ts');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toBindingIdentifierName: (name: string) => string = (t as any)
  .toBindingIdentifierName;

function stringifyMatcherForField(field: NodeField): string {
  const types = [
    `Matcher<${stringifyValidator(field.validate, 't.', '')}>`,
    ...possiblePrimitiveTypesForField(field)
  ];

  if (
    isValidatorOfType('array', field.validate) &&
    'chainOf' in field.validate
  ) {
    const elementType = typeForValidator(field.validate.chainOf[1]);

    types.push(
      stringifyType(elementType, (type, value) => {
        if (t.isTSTypeReference(type)) {
          return `Matcher<t.${value}>`;
        } else if (
          t.isTSLiteralType(type) ||
          t.isTSBooleanKeyword(type) ||
          t.isTSNumberKeyword(type) ||
          t.isTSStringKeyword(type) ||
          t.isTSUndefinedKeyword(type) ||
          t.isTSNullKeyword(type)
        ) {
          return `Matcher<${value}>`;
        }
      })
    );
  }

  if (field.optional) {
    types.push('null');
  }

  return types.join(' | ');
}

function possiblePrimitiveTypesForField(field: NodeField): Array<string> {
  return ['string', 'number', 'boolean'].filter(type =>
    isValidatorOfType(type, field.validate)
  );
}

interface SimpleWriter {
  write(data: string): void;
}

function writeToString(write: (writer: SimpleWriter) => void): string {
  let data = '';

  write({
    write(chunk: string): void {
      data += chunk;
    }
  });

  return data;
}

function rebuildTo(out: SimpleWriter): string | void {
  out.write(`/* eslint-disable */\n`);
  out.write(`import * as t from '@babel/types';\n\n`);

  out.write(dedent`
    export * from './matchers/spacers';
    export { default as Function } from './matchers/Function';
    export { default as Matcher } from './matchers/Matcher';
    export { default as anyExpression } from './matchers/anyExpression';
    export { default as anyList } from './matchers/anyList';
    export { default as anyNode } from './matchers/anyNode';
    export { default as anyNumber } from './matchers/anyNumber';
    export { default as anyStatement } from './matchers/anyStatement';
    export { default as anyString } from './matchers/anyString';
    export { default as anything } from './matchers/anything';
    export { default as arrayOf } from './matchers/arrayOf';
    export { default as capture, CaptureBase, CapturedMatcher } from './matchers/capture';
    export { default as containerOf } from './matchers/containerOf';
    export { default as fromCapture } from './matchers/fromCapture';
    export { default as function } from './matchers/Function';
    export { default as oneOf } from './matchers/oneOf';
    export { default as or } from './matchers/or';
    export { default as matcher } from './matchers/predicate';
    export { default as tupleOf } from './matchers/tupleOf';

    import tupleOf from './matchers/tupleOf';
    import { isNode } from './NodeTypes';
    import Matcher from './matchers/Matcher';
  `);

  out.write('\n\n');

  out.write('// aliases for keyword-named functions\n');

  const ALIASES = new Map([['Import', 'import'], ['Super', 'super']]);

  for (const [original, alias] of ALIASES.entries()) {
    out.write(`export { ${original} as ${alias} }\n`);
  }

  out.write('\n');

  for (const type of Object.keys(BUILDER_KEYS).sort()) {
    const keys = BUILDER_KEYS[type];
    const fields = NODE_FIELDS[type];
    const name = ALIASES.has(type) ? type : toFunctionName(type);

    out.write(`export class ${type}Matcher extends Matcher<t.${type}> {\n`);
    out.write(`  constructor(\n`);
    for (const key of keys) {
      const field = fields[key];
      const binding = toBindingIdentifierName(key);
      out.write(
        `    private readonly ${binding}?: ${stringifyMatcherForField(
          field
        )},\n`
      );
    }
    out.write(`  ) {\n`);
    out.write(`    super();\n`);
    out.write(`  }\n`);
    out.write(`\n`);
    out.write(
      `  matchValue(node: unknown, keys: ReadonlyArray<PropertyKey>): node is t.${type} {\n`
    );
    out.write(`    if (\n`);
    out.write(`      !isNode(node) ||\n`);
    out.write(`      !t.is${type}(node)\n`);
    out.write(`    ) {\n`);
    out.write(`      return false;\n`);
    out.write(`    }\n`);
    out.write(`\n`);
    for (const key of keys) {
      const field = fields[key];
      const keyString = `'${key}'`;
      const binding = `this.${toBindingIdentifierName(key)}`;
      out.write(`    if (typeof ${binding} === 'undefined') {\n`);
      out.write(`      // undefined matcher means anything matches\n`);
      for (const type of possiblePrimitiveTypesForField(field)) {
        out.write(`    } else if (typeof ${binding} === '${type}') {\n`);
        out.write(`      if (${binding} !== node.${key}) {\n`);
        out.write(`        return false;\n`);
        out.write(`      }\n`);
      }
      if (field.optional) {
        out.write(`    } else if (${binding} === null) {\n`);
        out.write(`      // null matcher means we expect null value\n`);
        out.write(`      if (node.${key} !== null) {\n`);
        out.write(`        return false;\n`);
        out.write(`      }\n`);
        out.write(`    } else if (node.${key} === null) {\n`);
        out.write(`      return false;\n`);
      }
      if (isValidatorOfType('array', field.validate)) {
        out.write(`    } else if (Array.isArray(${binding})) {\n`);
        out.write(
          `      if (!tupleOf<unknown>(...${binding}).matchValue(node.${key}, [...keys, ${keyString}])) {\n`
        );
        out.write(`        return false;\n`);
        out.write(`      }\n`);
      }
      out.write(
        `    } else if (!${binding}.matchValue(node.${key}, [...keys, ${keyString}])) {\n`
      );
      out.write(`      return false;\n`);
      out.write(`    }\n`);
      out.write(`\n`);
    }
    out.write(`    return true;\n`);
    out.write(`  }\n`);
    out.write(`}\n\n`);

    out.write(`export function ${name}(\n`);
    for (const key of keys) {
      const field = fields[key];
      const binding = toBindingIdentifierName(key);
      out.write(`  ${binding}?: ${stringifyMatcherForField(field)},\n`);
    }
    out.write(`): Matcher<t.${type}> {\n`);
    out.write(`  return new ${type}Matcher(\n`);
    for (const key of keys) {
      const binding = toBindingIdentifierName(key);
      out.write(`    ${binding},\n`);
    }
    out.write(`  );\n`);
    out.write(`}\n\n`);
  }
}

export default async function rebuild(): Promise<string> {
  return await format(writeToString(rebuildTo), MATCHERS_FILE_PATH);
}
