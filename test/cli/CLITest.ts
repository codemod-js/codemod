import { deepEqual, ok, strictEqual } from 'assert';
import { readFile } from 'mz/fs';
import { dirname, join } from 'path';
import { sync as rimraf } from 'rimraf';
import { valid } from 'semver';
import { inspect } from 'util';
import copyFixturesInto from '../helpers/copyFixturesInto';
import createTemporaryDirectory from '../helpers/createTemporaryDirectory';
import createTemporaryFile from '../helpers/createTemporaryFile';
import getTemporaryFilePath from '../helpers/getTemporaryFilePath';
import plugin from '../helpers/plugin';
import runCodemodCLI from '../helpers/runCodemodCLI';
import { startServer } from '../helpers/TestServer';

describe('CLI', function() {
  beforeEach(function() {
    rimraf(getTemporaryFilePath('.'));
  });

  it('prints help', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(['--help']);

    strictEqual(status, 0);
    ok(stdout.startsWith('codemod [OPTIONS]'));
    strictEqual(stderr, '');
  });

  it('prints the version', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(['--version']);
    let trimmedStdout = stdout.trim();

    strictEqual(status, 0);
    ok(
      valid(trimmedStdout),
      `${inspect(trimmedStdout)} should be valid semver`
    );
    strictEqual(stderr, '');
  });

  it('fails with an error when passing an invalid option', async function() {
    let { status, stdout, stderr } = await runCodemodCLI([
      '--not-a-real-option'
    ]);

    strictEqual(status, 1);
    strictEqual(stdout, '');
    ok(
      stderr.startsWith('ERROR: unexpected option: --not-a-real-option'),
      `stderr should start with "ERROR: unexpected option: --not-a-real-option", got: ${stderr}`
    );
  });

  it('fails with an error when a plugin throws an exception', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(
      ['--plugin', plugin('bad-plugin'), '--stdio'],
      '3+4'
    );

    strictEqual(status, 1);
    strictEqual(stdout, '');
    ok(
      stderr.startsWith('Error: I am a bad plugin'),
      `stderr should start with "Error: I am a bad plugin", got: ${stderr}`
    );
  });

  it('can read from stdin and write to stdout given the --stdio flag', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(['--stdio'], '3+4');

    strictEqual(status, 0);
    strictEqual(stdout, '3+4');
    strictEqual(stderr, '');
  });

  it('reads from a file, processes with plugins, then writes to that file', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
  });

  it('processes all matching files in a directory', async function() {
    let file1 = await createTemporaryFile('a-dir/file1.js', '3 + 4;');
    let file2 = await createTemporaryFile('a-dir/file2.ts', '0;');
    let file3 = await createTemporaryFile('a-dir/sub-dir/file3.jsx', '99;');
    let ignored = await createTemporaryFile('a-dir/ignored.css', '* {}');
    let { status, stdout, stderr } = await runCodemodCLI([
      dirname(file1),
      '-p',
      plugin('increment')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${file1}\n${file2}\n${file3}\n3 file(s), 3 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(
      await readFile(file1, 'utf8'),
      '4 + 5;',
      'file1.js is processed'
    );
    strictEqual(await readFile(file2, 'utf8'), '1;', 'file2.ts is processed');
    strictEqual(
      await readFile(file3, 'utf8'),
      '100;',
      'file3.jsx in a sub-directory is processed'
    );
    strictEqual(
      await readFile(ignored, 'utf8'),
      '* {}',
      'ignored.css is ignored'
    );
  });

  it('processes all matching files in a directory with custom extensions', async function() {
    let ignored = await createTemporaryFile('a-dir/ignored.js', '3 + 4;');
    let processed = await createTemporaryFile('a-dir/processed.myjs', '0;');
    let { status, stdout, stderr } = await runCodemodCLI([
      dirname(ignored),
      '-p',
      plugin('increment'),
      '--extensions',
      '.myjs'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${processed}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(ignored, 'utf8'), '3 + 4;');
    strictEqual(await readFile(processed, 'utf8'), '1;');
  });

  it('processes files but does not replace their contents when using --dry', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment'),
      '--dry'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\nDRY RUN: no files affected\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '3 + 4;');
  });

  it('prints files not processed in dim colors', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([afile]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '3 + 4;');
  });

  it('can load plugins written with ES modules by default', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-export-default')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
  });

  it('can load plugins written in TypeScript by default', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-typescript', '.ts')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
  });

  it('can implicitly find plugins with .ts extensions', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-typescript', '')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
  });

  it('does not try to load TypeScript files when --no-transpile-plugins is set', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    try {
      await runCodemodCLI([
        afile,
        '--no-transpile-plugins',
        '-p',
        plugin('increment-typescript', '')
      ]);
      ok(false, 'this command should have failed');
    } catch (err) {
      ok(
        /unable to resolve a plugin from source: .*increment-typescript/,
        `error should complain about loading plugin: ${err.stack}`
      );
    }
  });

  it('can load plugins with multiple files with ES modules by default`', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-export-default-multiple/increment-export-default')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
  });

  it('fails when specifying --find-babel-config as there are no plugins loaded', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    try {
      await runCodemodCLI([
        afile,
        '-p',
        plugin('increment-export-default'),
        '--find-babel-config'
      ]);
      ok(false, 'this command should have failed');
    } catch (err) {
      ok(
        /SyntaxError: Unexpected token export/.test(err.stack),
        `error should reference invalid syntax: ${err.stack}`
      );
    }
  });

  it('can load and run with a remote plugin', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let server = await startServer((req, res) => {
      strictEqual(req.url, '/plugin.js');

      readFile(plugin('increment-export-default'), { encoding: 'utf8' }).then(
        content => {
          res.end(content);
        }
      );
    });

    try {
      let { status, stdout, stderr } = await runCodemodCLI([
        afile,
        '--remote-plugin',
        server.requestURL('/plugin.js').toString()
      ]);

      deepEqual(
        { status, stdout, stderr },
        {
          status: 0,
          stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
          stderr: ''
        }
      );

      strictEqual(await readFile(afile, 'utf8'), '4 + 5;');
    } finally {
      await server.stop();
    }
  });

  it('can print using babel', async function() {
    let afile = await createTemporaryFile('a-file.js', 'var a=1;');
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--printer',
      'babel'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(await readFile(afile, 'utf8'), 'var a = 1;');
  });

  it('can print using prettier using its default settings', async function() {
    let workspace = await copyFixturesInto(
      'prettier/defaults',
      await createTemporaryDirectory('prettier/defaults')
    );
    let file = join(workspace, 'index.jsx');
    let original = await readFile(file, 'utf8');
    let { status, stdout, stderr } = await runCodemodCLI([
      workspace,
      '--printer',
      'prettier'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${file}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(await readFile(file, 'utf8'), original);
  });

  it('can print using prettier using custom config', async function() {
    let workspace = await copyFixturesInto(
      'prettier/with-config',
      await createTemporaryDirectory('prettier/with-config')
    );
    let file = join(workspace, 'index.js');
    let { status, stdout, stderr } = await runCodemodCLI([
      workspace,
      '--printer',
      'prettier'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${file}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(await readFile(file, 'utf8'), `var a = '';\n`);
  });

  it('can rewrite TypeScript files ending in `.ts`', async function() {
    let afile = await createTemporaryFile(
      'a-file.ts',
      'type A = any;\nlet a = {} as any;'
    );
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('replace-any-with-object', '.ts')
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(
      await readFile(afile, 'utf8'),
      'type A = object;\nlet a = {} as object;'
    );
  });

  it('can rewrite TypeScript files ending in `.tsx`', async function() {
    let afile = await createTemporaryFile(
      'a-file.tsx',
      'export default () => (<div/>);'
    );
    let { status, stdout, stderr } = await runCodemodCLI([afile]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(
      await readFile(afile, 'utf8'),
      'export default () => (<div/>);'
    );
  });

  it('can rewrite TypeScript files with prettier', async function() {
    let afile = await createTemporaryFile(
      'a-file.ts',
      'type A=any;\nlet a={} as any;'
    );
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--printer',
      'prettier'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );

    strictEqual(
      await readFile(afile, 'utf8'),
      'type A = any;\nlet a = {} as any;\n'
    );
  });

  it('can specify the source type as "script"', async function() {
    let afile = await createTemporaryFile(
      'a-file.js',
      'with (a) { b; }' // `with` statements aren't allowed in modules
    );
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--source-type',
      'script'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );
  });

  it('can specify the source type as "module"', async function() {
    let afile = await createTemporaryFile(
      'a-file.js',
      'import "./b-file"' // `import` statements aren't allowed in scripts
    );
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--source-type',
      'module'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );
  });

  it('can specify the source type as "unambiguous"', async function() {
    let afile = await createTemporaryFile(
      'a-file.js',
      'with (a) { b; }' // `with` statements aren't allowed in modules
    );
    let bfile = await createTemporaryFile(
      'b-file.js',
      'import "./a-file"' // `import` statements aren't allowed in scripts
    );
    let { status, stdout, stderr } = await runCodemodCLI([
      afile,
      bfile,
      '--source-type',
      'unambiguous'
    ]);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n${bfile}\n2 file(s), 0 modified, 0 errors\n`,
        stderr: ''
      }
    );
  });

  it('fails when given an invalid source type', async function() {
    let { status, stdout, stderr } = await runCodemodCLI([
      '--source-type',
      'hypercard'
    ]);
    let expectedPrefix = `ERROR: expected '--source-type' to be one of "module", "script", or "unambiguous" but got: "hypercard"`;

    ok(
      stderr.startsWith(expectedPrefix),
      `expected stderr to start with error but got:\n${stderr}`
    );

    deepEqual({ status, stdout }, { status: 1, stdout: '' });
  });
});
