import { deepEqual, strictEqual, throws } from 'assert';
import { inspect } from 'util';
import Config, { Printer } from '../../src/Config';
import Options, { Command } from '../../src/Options';

describe('Options', function() {
  it('has sensible defaults', function() {
    let config = getRunConfig(new Options([]).parse());
    deepEqual(config.extensions, new Set(['.js', '.jsx']));
    deepEqual(config.localPlugins, []);
    deepEqual(config.sourcePaths, []);
    deepEqual(config.requires, []);
    strictEqual(config.pluginOptions.size, 0);
    strictEqual(config.stdio, false);
  });

  it('interprets `--help` as asking for help', function() {
    strictEqual(new Options(['--help']).parse().kind, 'help');
  });

  it('interprets `--version` as asking to print the version', function() {
    strictEqual(new Options(['--version']).parse().kind, 'version');
  });

  it('interprets `--extensions` as expected', function() {
    let config = getRunConfig(
      new Options(['--extensions', '.js,.jsx,.ts']).parse()
    );
    deepEqual(config.extensions, new Set(['.js', '.jsx', '.ts']));
  });

  it('fails to parse unknown options', function() {
    throws(() => new Options(['--wtf']).parse(), 'unexpected option: --wtf');
  });

  it('interprets non-option arguments as paths', function() {
    let config = getRunConfig(new Options(['src/', 'a.js']).parse());
    deepEqual(config.sourcePaths, ['src/', 'a.js']);
  });

  it('treats sources as globs', function() {
    let config = getRunConfig(
      new Options(['test/fixtures/glob-test/**/*.js']).parse()
    );
    deepEqual(config.sourcePaths, [
      'test/fixtures/glob-test/abc.js',
      'test/fixtures/glob-test/subdir/def.js'
    ]);
  });

  it('interprets `--stdio` as reading/writing stdin/stdout', function() {
    let config = getRunConfig(new Options(['--stdio']).parse());
    strictEqual(config.stdio, true);
  });

  it('can parse inline plugin options as JSON', function() {
    let config = getRunConfig(
      new Options(['-o', 'my-plugin={"foo": true}']).parse()
    );
    deepEqual(config.pluginOptions.get('my-plugin'), { foo: true });
  });

  it('associates plugin options based on declared name', async function() {
    let config = getRunConfig(
      new Options([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'basic-plugin={"a": true}'
      ]).parse()
    );

    deepEqual(config.pluginOptions.get('basic-plugin'), { a: true });
  });

  it('interprets `--require` as expected', function() {
    let config = getRunConfig(new Options(['--require', 'mz']).parse());
    deepEqual(config.requires, ['mz'].map(name => require.resolve(name)));
  });

  it('associates plugin options based on inferred name', async function() {
    let config = getRunConfig(
      new Options([
        '--plugin',
        './test/fixtures/plugin/index.js',
        '--plugin-options',
        'index={"a": true}'
      ]).parse()
    );

    // "index" is the name of the file
    deepEqual(config.pluginOptions.get('index'), { a: true });

    let babelPlugin = await config.getBabelPlugin('index');

    if (!Array.isArray(babelPlugin)) {
      throw new Error(
        `expected plugin to be [plugin, options] tuple: ${inspect(babelPlugin)}`
      );
    }

    deepEqual(babelPlugin[1], { a: true });
  });

  it('can parse a JSON file for plugin options', function() {
    // You wouldn't actually use package.json, but it's a convenient JSON file.
    let config = getRunConfig(
      new Options(['-o', 'my-plugin=@package.json']).parse()
    );
    let pluginOpts = config.pluginOptions.get('my-plugin');
    strictEqual(pluginOpts && pluginOpts['name'], 'babel-codemod');
  });

  it('should set dry option', function() {
    let config = getRunConfig(new Options(['--dry']).parse());
    strictEqual(config.dry, true);
  });

  it('should set useLocalBabel', function() {
    let config = getRunConfig(new Options(['--find-babel-config']).parse());
    strictEqual(config.findBabelConfig, true);
  });

  it('uses the recast printer by default', function() {
    let config = getRunConfig(new Options([]).parse());
    strictEqual(config.printer, Printer.Recast);
  });

  it('can use the prettier printer', function() {
    let config = getRunConfig(new Options(['--printer', 'prettier']).parse());
    strictEqual(config.printer, Printer.Prettier);
  });

  it('can use the babel printer', function() {
    let config = getRunConfig(new Options(['--printer', 'babel']).parse());
    strictEqual(config.printer, Printer.Babel);
  });

  function getRunConfig(command: Command): Config {
    if (command.kind === 'run') {
      return command.config;
    } else {
      throw new Error(`expected a run command but got: ${inspect(command)}`);
    }
  }
});
