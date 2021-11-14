import { dirname } from 'path'
import createTemporaryFile, {
  createTemporaryFiles,
} from '../helpers/createTemporaryFile'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

it('can specify the source type as "script"', async function () {
  const afile = await createTemporaryFile(
    'a-file.js',
    'with (a) { b; }' // `with` statements aren't allowed in modules
  )
  expect(
    await runCodemodCLI([afile, '--source-type', 'script'], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 0 modified, 0 errors\n`,
    stderr: '',
  })
})

it('can specify the source type as "module"', async function () {
  const afile = await createTemporaryFile(
    'a-file.js',
    'import "./b-file"' // `import` statements aren't allowed in scripts
  )
  expect(
    await runCodemodCLI([afile, '--source-type', 'module'], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 0 modified, 0 errors\n`,
    stderr: '',
  })
})

it('can specify the source type as "unambiguous"', async function () {
  const [afile, bfile] = await createTemporaryFiles(
    [
      'a-file.js',
      'with (a) { b; }', // `with` statements aren't allowed in modules
    ],
    [
      'b-file.js',
      'import "./a-file"', // `import` statements aren't allowed in scripts
    ]
  )
  expect(
    await runCodemodCLI([afile, bfile, '--source-type', 'unambiguous'], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\nb-file.js\n2 file(s), 0 modified, 0 errors\n`,
    stderr: '',
  })
})

it('fails when given an invalid source type', async function () {
  expect(await runCodemodCLI(['--source-type', 'hypercard'])).toEqual({
    status: 1,
    stdout: '',
    stderr: expect.stringContaining(
      `ERROR: expected '--source-type' to be one of "module", "script", or "unambiguous" but got: "hypercard"`
    ),
  })
})
