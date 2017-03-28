import { deepEqual, strictEqual } from 'assert';
import Options, { ParseOptionsResult } from '../src/Options';

describe('Options', function() {
  it('has sensible defaults', function() {
    let options = assertOptionsParsed(Options.parse([]));
    deepEqual(options.extensions, new Set(['.js', '.jsx']));
    deepEqual(options.pluginFilePaths, []);
    deepEqual(options.sourcePaths, []);
    deepEqual(options.requires, []);
    strictEqual(options.pluginOptions.size, 0);
    strictEqual(options.stdio, false);
  });

  it('interprets `--extensions` as expected', function() {
    let options = assertOptionsParsed(Options.parse(['--extensions', '.js,.jsx,.ts']));
    deepEqual(options.extensions, new Set(['.js', '.jsx', '.ts']));
  });

  it('fails to parse unknown options', function() {
    let error = assertParseFailed(Options.parse(['--wtf']));
    strictEqual(error.message, 'unexpected option: --wtf');
  });

  it('allows existing file paths as plugins', function() {
    let options = assertOptionsParsed(Options.parse(['--plugin', __filename]));
    deepEqual(options.pluginFilePaths, [__filename]);
  });

  it('interprets non-option arguments as paths', function() {
    let options = assertOptionsParsed(Options.parse(['src/', 'a.js']));
    deepEqual(options.sourcePaths, ['src/', 'a.js']);
  });

  it('interprets `--stdio` as reading/writing stdin/stdout', function() {
    let options = assertOptionsParsed(Options.parse(['--stdio']));
    strictEqual(options.stdio, true);
  });

  it('can parse inline plugin options as JSON', function() {
    let options = assertOptionsParsed(Options.parse(['-o', 'my-plugin={"foo": true}']));
    deepEqual(options.pluginOptions.get('my-plugin'), { foo: true });
  });

  it('can parse a JSON file for plugin options', function() {
    // You wouldn't actually use package.json, but it's a convenient JSON file.
    let options = assertOptionsParsed(Options.parse(['-o', 'my-plugin=@package.json']));
    let pluginOpts = options.pluginOptions.get('my-plugin');
    strictEqual(pluginOpts && pluginOpts['name'], 'babel-codemod');
  });

  function assertOptionsParsed(result: ParseOptionsResult): Options {
    if (result instanceof Options) {
      return result;
    }

    throw new Error(`expected Options, got error: ${result}`);
  }

  function assertParseFailed(result: ParseOptionsResult): Error {
    if (result instanceof Error) {
      return result;
    }

    throw new Error(`expected error, got Options: ${result}`);
  }
});
