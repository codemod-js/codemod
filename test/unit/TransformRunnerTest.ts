import * as Babel from '@babel/core';
import { NodePath } from '@babel/traverse';
import { NumericLiteral, Program } from '@babel/types';
import { deepEqual, strictEqual } from 'assert';
import { join } from 'path';
import TransformRunner, {
  Source,
  SourceTransformResult
} from '../../src/TransformRunner';

describe('TransformRunner', function() {
  async function run(runner: TransformRunner) {
    let result: Array<SourceTransformResult> = [];

    for await (let transformResult of runner.run()) {
      result.push(transformResult);
    }

    return result;
  }

  it('passes source through as-is when there are no plugins', async function() {
    let source = new Source('a.js', 'a + b;');
    let runner = new TransformRunner([source], []);
    let result = await run(runner);

    deepEqual(result, [
      new SourceTransformResult(source, source.content, null)
    ]);
  });

  it('transforms source using plugins', async function() {
    let source = new Source('a.js', '3 + 4;');
    let plugin = function(babel: typeof Babel) {
      return {
        visitor: {
          NumericLiteral(path: NodePath<NumericLiteral>) {
            path.node.value++;
          }
        }
      };
    };
    let runner = new TransformRunner([source], [plugin]);
    let result = await run(runner);

    deepEqual(result, [new SourceTransformResult(source, '4 + 5;', null)]);
  });

  it('does not include any plugins not specified explicitly', async function() {
    let source = new Source('a.js', 'export default 0;');
    let runner = new TransformRunner([source], []);
    let result = await run(runner);

    deepEqual(result, [
      new SourceTransformResult(source, 'export default 0;', null)
    ]);
  });

  it('allows running plugins with options', async function() {
    let source = new Source('a.js', '3 + 4;');
    let plugin = function(babel: typeof Babel) {
      return {
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
      };
    };
    let runner = new TransformRunner([source], [[plugin, { value: 3 }]]);
    let result = await run(runner);

    deepEqual(result, [new SourceTransformResult(source, '4 + 4;', null)]);
  });

  it('passes the filename', async function() {
    let source = new Source('a.js', '');
    let filename;
    let plugin = function(babel: typeof Babel) {
      return {
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
      };
    };

    // Consume all results, but ignore them.
    await run(new TransformRunner([source], [plugin]));

    strictEqual(filename, join(process.cwd(), 'a.js'));
  });
});
