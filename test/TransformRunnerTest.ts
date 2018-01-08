import { deepEqual, strictEqual } from 'assert';
import * as Babel from 'babel-core';
import { NodePath } from 'babel-traverse';
import { NumericLiteral, Program } from 'babel-types';
import { EOL } from 'os';
import TransformRunner, { Source, SourceTransformResult } from '../src/TransformRunner';

describe('TransformRunner', function() {
  it('passes source through as-is when there are no plugins', function() {
    let source = new Source('a.js', 'a + b;');
    let runner = new TransformRunner([source], []);
    let result = Array.from(runner.run());

    deepEqual(
      result,
      [new SourceTransformResult(source, source.content, null)]
    );
  });

  it('transforms source using plugins', function() {
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
    let result = Array.from(runner.run());

    deepEqual(
      result,
      [new SourceTransformResult(source, '4 + 5;', null)]
    );
  });

  it('does not include any plugins not specified explicitly', function() {
    let source = new Source('a.js', `export default 0;${EOL}`);
    let runner = new TransformRunner([source], []);
    let result = Array.from(runner.run());

    deepEqual(
      result,
      [new SourceTransformResult(source, `export default 0;${EOL}`, null)]
    );
  });

  it('allows running plugins with options', function() {
    let source = new Source('a.js', '3 + 4;');
    let plugin = function(babel: typeof Babel) {
      return {
        visitor: {
          NumericLiteral(path: NodePath<NumericLiteral>, state: { opts: { value?: number } }) {
            if (state.opts.value === path.node.value) {
              path.node.value++;
            }
          }
        }
      };
    };
    let runner = new TransformRunner([source], [[plugin, { value: 3 }]]);
    let result = Array.from(runner.run());

    deepEqual(
      result,
      [new SourceTransformResult(source, '4 + 4;', null)]
    );
  });

  it('passes the filename', function() {
    let source = new Source('a.js', '');
    let filename;
    let filenameRelative;
    let plugin = function(babel: typeof Babel) {
      return {
        visitor: {
          Program(path: NodePath<Program>, state: { file: { opts: { filename: string, filenameRelative: string } } }) {
            filename = state.file.opts.filename;
            filenameRelative = state.file.opts.filenameRelative;
          }
        }
      };
    };

    // Consume all results, but ignore them.
    Array.from(new TransformRunner([source], [plugin]).run());

    strictEqual(filename, 'a.js');
    strictEqual(filenameRelative, 'a.js');
  });
});
