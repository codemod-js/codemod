import { deepEqual } from 'assert';
import * as Babel from 'babel-core';
import { NodePath } from 'babel-traverse';
import { NumericLiteral } from 'babel-types';
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
});
