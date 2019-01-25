import { NodePath } from '@babel/traverse';
import { Identifier, NumericLiteral, Program } from '@babel/types';
import { strictEqual } from 'assert';
import { join } from 'path';
import { PluginObj } from '../../src/BabelPluginTypes';
import InlineTransformer from '../../src/InlineTransformer';

describe('InlineTransformer', function() {
  it('passes source through as-is when there are no plugins', async function() {
    let filepath = 'a.js';
    let content = 'a + b;';
    let transformer = new InlineTransformer([]);
    let output = await transformer.transform(filepath, content);

    strictEqual(output, content);
  });

  it('transforms source using plugins', async function() {
    let filepath = 'a.js';
    let content = '3 + 4;';
    let transformer = new InlineTransformer([
      (): PluginObj =>
        ({
          visitor: {
            NumericLiteral(path: NodePath<NumericLiteral>): void {
              path.node.value++;
            }
          }
        } as PluginObj) /* conflicting definitions of `@babel/types`? */
    ]);
    let output = await transformer.transform(filepath, content);

    strictEqual(output, '4 + 5;');
  });

  it('does not include any plugins not specified explicitly', async function() {
    let filepath = 'a.js';
    let content = 'export default 0;';
    let transformer = new InlineTransformer([]);
    let output = await transformer.transform(filepath, content);

    strictEqual(output, 'export default 0;');
  });

  it('allows running plugins with options', async function() {
    let filepath = 'a.js';
    let content = '3 + 4;';
    let transformer = new InlineTransformer([
      [
        (): PluginObj =>
          ({
            visitor: {
              NumericLiteral(
                path: NodePath<NumericLiteral>,
                state: { opts: { value?: number } }
              ) {
                if (state.opts.value === path.node.value) {
                  path.node.value++;
                }
              }
            }
          } as PluginObj) /* conflicting definitions of `@babel/types`? */,
        { value: 3 }
      ]
    ]);
    let output = await transformer.transform(filepath, content);

    strictEqual(output, '4 + 4;');
  });

  it('passes the filename', async function() {
    let filepath = 'a.js';
    let content = '';
    let filename: string | undefined;

    let transformer = new InlineTransformer([
      (): PluginObj =>
        ({
          visitor: {
            Program(
              path: NodePath<Program>,
              state: {
                file: { opts: { filename: string } };
              }
            ) {
              filename = state.file.opts.filename;
            }
          }
        } as PluginObj) /* conflicting definitions of `@babel/types`? */
    ]);

    // Ignore the result since we only care about arguments to the visitor.
    await transformer.transform(filepath, content);

    strictEqual(filename, join(process.cwd(), 'a.js'));
  });

  it('does not add extra semicolons to "use strict" when removing the statement before it', async function() {
    let filepath = 'a.js';
    let content = `(function () {
  "use strict";
  hello;
})();`;

    let transformer = new InlineTransformer([
      (): PluginObj =>
        ({
          visitor: {
            Identifier(path: NodePath<Identifier>) {
              path.remove();
            }
          }
        } as PluginObj) /* conflicting definitions of `@babel/types`? */
    ]);

    let output = await transformer.transform(filepath, content);

    strictEqual(
      output,
      `(function () {
  "use strict";
})();`
    );
  });
});
