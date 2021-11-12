import { strict as assert } from 'assert'
import * as fs from 'fs'
import { dirname, join } from 'path'
import { sync as rimraf } from 'rimraf'
import { valid } from 'semver'
import { inspect, promisify } from 'util'
import copyFixturesInto from '../helpers/copyFixturesInto'
import createTemporaryDirectory from '../helpers/createTemporaryDirectory'
import createTemporaryFile from '../helpers/createTemporaryFile'
import getTemporaryFilePath from '../helpers/getTemporaryFilePath'
import plugin from '../helpers/plugin'
import runCodemodCLI from '../helpers/runCodemodCLI'
import { startServer } from '../helpers/TestServer'

const readFile = promisify(fs.readFile)

describe('CLI', function () {
  beforeEach(function () {
    rimraf(getTemporaryFilePath('.'))
  })

  it('prints help', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(['--help'])

    assert.equal(status, 0)
    assert(stdout.startsWith('codemod [OPTIONS]'))
    assert.equal(stderr, '')
  })

  it('prints the version', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(['--version'])
    const trimmedStdout = stdout.trim()

    assert.equal(status, 0)
    assert(
      valid(trimmedStdout),
      `${inspect(trimmedStdout)} should be valid semver`
    )
    assert.equal(stderr, '')
  })

  it('fails with an error when passing an invalid option', async function () {
    const { status, stdout, stderr } = await runCodemodCLI([
      '--not-a-real-option',
    ])

    assert.equal(status, 1)
    assert.equal(stdout, '')
    assert(
      stderr.startsWith('ERROR: unexpected option: --not-a-real-option'),
      `stderr should start with "ERROR: unexpected option: --not-a-real-option", got: ${stderr}`
    )
  })

  it('fails with an error when a plugin throws an exception', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(
      ['--plugin', plugin('bad-plugin'), '--stdio'],
      '3+4'
    )

    assert.equal(status, 1)
    assert.equal(stdout, '')
    assert(
      stderr.includes('I am a bad plugin'),
      `stderr should include "I am a bad plugin", got: ${stderr}`
    )
  })

  it('can read from stdin and write to stdout given the --stdio flag', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(['--stdio'], '3+4')

    assert.equal(status, 0)
    assert.equal(stdout, '3+4')
    assert.equal(stderr, '')
  })

  it('reads from a file, processes with plugins, then writes to that file', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
  })

  it('processes all matching files in a directory', async function () {
    const file1 = await createTemporaryFile('a-dir/file1.js', '3 + 4;')
    const file2 = await createTemporaryFile('a-dir/file2.ts', '0;')
    const file3 = await createTemporaryFile('a-dir/sub-dir/file3.jsx', '99;')
    const ignored = await createTemporaryFile('a-dir/ignored.css', '* {}')
    const { status, stdout, stderr } = await runCodemodCLI([
      dirname(file1),
      '-p',
      plugin('increment'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${file1}\n${file2}\n${file3}\n3 file(s), 3 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(
      await readFile(file1, 'utf8'),
      '4 + 5;',
      'file1.js is processed'
    )
    assert.equal(await readFile(file2, 'utf8'), '1;', 'file2.ts is processed')
    assert.equal(
      await readFile(file3, 'utf8'),
      '100;',
      'file3.jsx in a sub-directory is processed'
    )
    assert.equal(
      await readFile(ignored, 'utf8'),
      '* {}',
      'ignored.css is ignored'
    )
  })

  it('processes all matching files in a directory with custom extensions', async function () {
    const ignored = await createTemporaryFile('a-dir/ignored.js', '3 + 4;')
    const processed = await createTemporaryFile('a-dir/processed.myjs', '0;')
    const { status, stdout, stderr } = await runCodemodCLI([
      dirname(ignored),
      '-p',
      plugin('increment'),
      '--extensions',
      '.myjs',
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${processed}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(ignored, 'utf8'), '3 + 4;')
    assert.equal(await readFile(processed, 'utf8'), '1;')
  })

  it('ignores .d.ts files', async function () {
    const ignored = await createTemporaryFile(
      'a-dir/ignored.d.ts',
      'export = 42;'
    )
    const { status, stdout, stderr } = await runCodemodCLI([dirname(ignored)])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `0 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(ignored, 'utf8'), 'export = 42;')
  })

  it('processes files but does not replace their contents when using --dry', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment'),
      '--dry',
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\nDRY RUN: no files affected\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '3 + 4;')
  })

  it('prints files not processed in dim colors', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([afile])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '3 + 4;')
  })

  it('can load plugins written with ES modules by default', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-export-default'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
  })

  it('can load plugins written in TypeScript by default', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-typescript', '.ts'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
  })

  it('can implicitly find plugins with .ts extensions', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-typescript', ''),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
  })

  it('does not try to load TypeScript files when --no-transpile-plugins is set', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    try {
      await runCodemodCLI([
        afile,
        '--no-transpile-plugins',
        '-p',
        plugin('increment-typescript', ''),
      ])
      assert(false, 'this command should have failed')
    } catch (err) {
      assert(
        /unable to resolve a plugin from source: .*increment-typescript/,
        `error should complain about loading plugin: ${err.stack}`
      )
    }
  })

  it('can load plugins with multiple files with ES modules by default`', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('increment-export-default-multiple/increment-export-default'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )
    assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
  })

  it('can load and run with a remote plugin', async function () {
    const afile = await createTemporaryFile('a-file.js', '3 + 4;')
    const server = await startServer((req, res) => {
      assert.equal(req.url, '/plugin.js')

      readFile(plugin('increment-export-default'), { encoding: 'utf8' }).then(
        (content) => {
          res.end(content)
        }
      )
    })

    try {
      const { status, stdout, stderr } = await runCodemodCLI([
        afile,
        '--remote-plugin',
        server.requestURL('/plugin.js').toString(),
      ])

      assert.deepEqual(
        { status, stdout, stderr },
        {
          status: 0,
          stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
          stderr: '',
        }
      )

      assert.equal(await readFile(afile, 'utf8'), '4 + 5;')
    } finally {
      await server.stop()
    }
  })

  it('can rewrite TypeScript files ending in `.ts`', async function () {
    const afile = await createTemporaryFile(
      'a-file.ts',
      'type A = any;\nlet a = {} as any;'
    )
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '-p',
      plugin('replace-any-with-object', '.ts'),
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
        stderr: '',
      }
    )

    assert.equal(
      await readFile(afile, 'utf8'),
      'type A = object;\nlet a = {} as object;'
    )
  })

  it('can rewrite TypeScript files ending in `.tsx`', async function () {
    const afile = await createTemporaryFile(
      'a-file.tsx',
      'export default () => (<div/>);'
    )
    const { status, stdout, stderr } = await runCodemodCLI([afile])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )

    assert.equal(
      await readFile(afile, 'utf8'),
      'export default () => (<div/>);'
    )
  })

  it('can specify the source type as "script"', async function () {
    const afile = await createTemporaryFile(
      'a-file.js',
      'with (a) { b; }' // `with` statements aren't allowed in modules
    )
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--source-type',
      'script',
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )
  })

  it('can specify the source type as "module"', async function () {
    const afile = await createTemporaryFile(
      'a-file.js',
      'import "./b-file"' // `import` statements aren't allowed in scripts
    )
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      '--source-type',
      'module',
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )
  })

  it('can specify the source type as "unambiguous"', async function () {
    const afile = await createTemporaryFile(
      'a-file.js',
      'with (a) { b; }' // `with` statements aren't allowed in modules
    )
    const bfile = await createTemporaryFile(
      'b-file.js',
      'import "./a-file"' // `import` statements aren't allowed in scripts
    )
    const { status, stdout, stderr } = await runCodemodCLI([
      afile,
      bfile,
      '--source-type',
      'unambiguous',
    ])

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${afile}\n${bfile}\n2 file(s), 0 modified, 0 errors\n`,
        stderr: '',
      }
    )
  })

  it('fails when given an invalid source type', async function () {
    const { status, stdout, stderr } = await runCodemodCLI([
      '--source-type',
      'hypercard',
    ])
    const expectedPrefix = `ERROR: expected '--source-type' to be one of "module", "script", or "unambiguous" but got: "hypercard"`

    assert(
      stderr.startsWith(expectedPrefix),
      `expected stderr to start with error but got:\n${stderr}`
    )

    assert.deepEqual({ status, stdout }, { status: 1, stdout: '' })
  })

  it('ignores babel.config.js files by default', async function () {
    const workspace = await copyFixturesInto(
      'babel-config',
      await createTemporaryDirectory('babel-config')
    )
    const { status, stdout, stderr } = await runCodemodCLI(
      ['index.js'],
      undefined,
      workspace
    )

    assert.equal(
      await readFile(join(workspace, 'index.js'), 'utf8'),
      'const a = 1\n',
      'file contents should not change'
    )

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: 'index.js\n1 file(s), 0 modified, 0 errors\n',
        stderr: '',
      }
    )
  })

  it('can load a plugin that uses class properties', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(
      ['--plugin', plugin('class-properties', '.ts'), '--stdio'],
      ''
    )

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: '',
        stderr: '',
      }
    )
  })

  it('can load a plugin that uses generators', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(
      ['--plugin', plugin('generators', '.ts'), '--stdio'],
      ''
    )

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: '',
        stderr: '',
      }
    )
  })

  it('can pass options to a plugin without naming it', async function () {
    const { status, stdout, stderr } = await runCodemodCLI(
      [
        '--plugin',
        plugin('append-options-string', '.ts'),
        '--plugin-options',
        `${JSON.stringify({ a: 4 })}`,
        '--stdio',
      ],
      ''
    )

    assert.deepEqual(
      { status, stdout, stderr },
      {
        status: 0,
        stdout: `${JSON.stringify(JSON.stringify({ a: 4 }))};`,
        stderr: '',
      }
    )
  })
})
