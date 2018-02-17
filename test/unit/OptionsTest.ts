import { deepEqual, strictEqual } from 'assert';
import { inspect } from 'util';
import Options, { ParseOptionsResult } from '../../src/Options';

describe('Options', function() {
  it('has sensible defaults', function() {
    let options = assertOptionsParsed(Options.parse([]));
    deepEqual(options.extensions, new Set(['.js', '.jsx']));
    deepEqual(options.localPlugins, []);
    deepEqual(options.sourcePaths, []);
    deepEqual(options.requires, []);
    strictEqual(options.pluginOptions.size, 0);
    strictEqual(options.stdio, false);
  });

  it('interprets `--extensions` as expected', function() {
    let options = assertOptionsParsed(
      Options.parse(['--extensions', '.js,.jsx,.ts'])
    );
    deepEqual(options.extensions, new Set(['.js', '.jsx', '.ts']));
  });

  it('fails to parse unknown options', function() {
    let error = assertParseFailed(Options.parse(['--wtf']));
    strictEqual(error.message, 'unexpected option: --wtf');
  });

  it('interprets non-option arguments as paths', function() {
    let options = assertOptionsParsed(Options.parse(['src/', 'a.js']));
    deepEqual(options.sourcePaths, ['src/', 'a.js']);
  });

  it('treats sources as globs', function() {
    let options = assertOptionsParsed(
      Options.parse(['test/fixtures/glob-test/**/*.js'])
    );
    deepEqual(options.sourcePaths, [
      'test/fixtures/glob-test/abc.js',
      'test/fixtures/glob-test/subdir/def.js'
    ]);
  });

  it('interprets `--stdio` as reading/writing stdin/stdout', function() {
    let options = assertOptionsParsed(Options.parse(['--stdio']));
    strictEqual(options.stdio, true);
  });

  it('can parse inline plugin options as JSON', function() {
    let options = assertOptionsParsed(
      Options.parse(['-o', 'my-plugin={"foo": true}'])
    );
    deepEqual(options.pluginOptions.get('my-plugin'), { foo: true });
  });

  it('associates plugin options based on declared name', async function() {
    let options = assertOptionsParsed(
      Options.parse([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'basic-plugin={"a": true}'
      ])
    );

    // "basic-plugin" is declared in the plugin file
    deepEqual(options.pluginOptions.get('basic-plugin'), { a: true });

    let babelPlugin = await options.getBabelPlugin('basic-plugin');

    if (!Array.isArray(babelPlugin)) {
      throw new Error(
        `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
      );
    }

    deepEqual(babelPlugin[1], { a: true });
  });

  it('interprets `--require` as expected', function() {
    let options = assertOptionsParsed(Options.parse(['--require', 'mz']));
    deepEqual(options.requires, ['mz'].map(name => require.resolve(name)));
  });

  it('associates plugin options based on inferred name', async function() {
    let options = assertOptionsParsed(
      Options.parse([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'index={"a": true}'
      ])
    );

    // "index" is the name of the file
    deepEqual(options.pluginOptions.get('index'), { a: true });

    let babelPlugin = await options.getBabelPlugin('index');

    if (!Array.isArray(babelPlugin)) {
      throw new Error(
        `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
      );
    }

    deepEqual(babelPlugin[1], { a: true });
  });

  it('can parse a JSON file for plugin options', function() {
    // You wouldn't actually use package.json, but it's a convenient JSON file.
    let options = assertOptionsParsed(
      Options.parse(['-o', 'my-plugin=@package.json'])
    );
    let pluginOpts = options.pluginOptions.get('my-plugin');
    strictEqual(pluginOpts && pluginOpts['name'], 'babel-codemod');
  });

  it('should set dry option', function() {
    let options = assertOptionsParsed(Options.parse(['--dry']));
    strictEqual(options.dry, true);
  });

  it('should set useLocalBabel', function() {
    let options = assertOptionsParsed(Options.parse(['--find-babel-config']));
    strictEqual(options.findBabelConfig, true);
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
