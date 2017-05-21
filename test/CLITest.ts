import { deepEqual, ok, strictEqual } from 'assert';
import { execFile } from 'child_process';
import { mkdir, readFile, writeFile } from 'mz/fs';
import { basename, dirname, join } from 'path';
import { sync as rimraf } from 'rimraf';

function plugin(name: string): string {
  return join(__dirname, `fixtures/plugin/${name}.js`);
}

type CLIResult = { status: number, stdout: string, stderr: string };

async function runCodemodCLI(args: Array<string>, stdin?: string): Promise<CLIResult> {
  return new Promise((resolve: (result: CLIResult) => void, reject: (error: Error) => void) => {
    let child = execFile(join(__dirname, '../bin/codemod'), args);
    let stdout = '';
    let stderr = '';

    child.stdin.end(stdin);

    child.on('close', status => {
      resolve({ status, stdout, stderr });
    });

    child.stdout.on('data', chunk => {
      stdout += chunk;
    });

    child.stderr.on('data', chunk => {
      stderr += chunk;
    });

    child.on('error', reject);
  });
}

async function mkdirp(path: string): Promise<void> {
  let parent = dirname(path);
  let name = basename(path);

  if (parent === '.' || parent === '/') {
    try {
      await mkdir(name);
    } catch (err) {}
  } else {
    await mkdirp(parent);
    try {
      await mkdir(path);
    } catch (err) {}
  }
}

function getTemporaryFilePath(path: string): string {
  return join(__dirname, '../tmp', path);
}

async function createTemporaryFile(path: string, content: string): Promise<string> {
  let fullPath = getTemporaryFilePath(path);

  await mkdirp(dirname(fullPath));
  await writeFile(fullPath, content, 'utf8');

  return fullPath;
}

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

  it('fails with an error when passing an invalid option', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(['--not-a-real-option']);

    strictEqual(status, 1);
    strictEqual(stdout, '');
    ok(
      stderr.startsWith('ERROR: unexpected option: --not-a-real-option'),
      `stderr should start with "ERROR: unexpected option: --not-a-real-option", got: ${stderr}`
    );
  });

  it('can read from stdin and write to stdout given the --stdio flag', async function() {
    let { status, stdout, stderr } = await runCodemodCLI(['--stdio'], '3+4');

    strictEqual(status, 0);
    strictEqual(stdout, '3+4\n');
    strictEqual(stderr, '');
  });

  it('reads from a file, processes with plugins, then writes to that file', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([afile, '-p', plugin('increment')]);

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
    let file2 = await createTemporaryFile('a-dir/file2.js', '0;');
    let file3 = await createTemporaryFile('a-dir/sub-dir/file3.jsx', '99;');
    let ignored = await createTemporaryFile('a-dir/ignored.es6', '8;');
    let { status, stdout, stderr } = await runCodemodCLI([dirname(file1), '-p', plugin('increment')]);

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
    strictEqual(
      await readFile(file2, 'utf8'),
      '1;',
      'file2.js is processed'
    );
    strictEqual(
      await readFile(file3, 'utf8'),
      '100;',
      'file3.jsx in a sub-directory is processed'
    );
    strictEqual(
      await readFile(ignored, 'utf8'),
      '8;',
      'ignored.es6 is ignored'
    );
  });

  it('processes all matching files in a directory with custom extensions', async function() {
    let ignored = await createTemporaryFile('a-dir/ignored.js', '3 + 4;');
    let processed = await createTemporaryFile('a-dir/processed.es6', '0;');
    let { status, stdout, stderr } = await runCodemodCLI([dirname(ignored), '-p', plugin('increment'), '--extensions', '.es6']);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${processed}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(
      await readFile(ignored, 'utf8'),
      '3 + 4;'
    );
    strictEqual(
      await readFile(processed, 'utf8'),
      '1;'
    );
  });

  it('processes files but does not replace their contents when using --dry', async function() {
    let afile = await createTemporaryFile('a-file.js', '3 + 4;');
    let { status, stdout, stderr } = await runCodemodCLI([afile, '-p', plugin('increment'), '--dry']);

    deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\nDRY RUN: no files affected\n1 file(s), 1 modified, 0 errors\n`,
        stderr: ''
      }
    );
    strictEqual(
      await readFile(afile, 'utf8'),
      '3 + 4;'
    );
  });
});
