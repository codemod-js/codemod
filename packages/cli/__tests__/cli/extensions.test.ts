import { promises as fs } from 'fs'
import { dirname } from 'path'
import createTemporaryFile, {
  createTemporaryFiles,
} from '../helpers/createTemporaryFile'
import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

test('can load plugins written with ES modules by default', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([afile, '-p', plugin('increment-export-default')], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
})

test('can load plugins written in TypeScript by default', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([afile, '-p', plugin('increment-typescript', '.ts')], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
})

test('can implicitly find plugins with .ts extensions', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([afile, '-p', plugin('increment-typescript', '')], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
})

test('can load plugins with multiple files with ES modules by default`', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI(
      [
        afile,
        '-p',
        plugin('increment-export-default-multiple/increment-export-default'),
      ],
      { cwd: dirname(afile) }
    )
  ).toEqual({
    status: 0,
    stdout: `a-file.js\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
})

test('processes all matching files in a directory with custom extensions', async function () {
  const [ignored, processed] = await createTemporaryFiles(
    ['ignored.js', '3 + 4;'],
    ['processed.myjs', '0;']
  )
  expect(
    await runCodemodCLI(
      [dirname(ignored), '-p', plugin('increment'), '--extensions', '.myjs'],
      { cwd: dirname(ignored) }
    )
  ).toEqual({
    status: 0,
    stdout: `processed.myjs\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(ignored, 'utf8')).toEqual('3 + 4;')
  expect(await fs.readFile(processed, 'utf8')).toEqual('1;')
})
