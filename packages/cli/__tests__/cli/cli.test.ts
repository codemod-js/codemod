import { promises as fs } from 'fs'
import { dirname, resolve as pathResolve } from 'path'
import createTemporaryFile, {
  createTemporaryFiles,
} from '../helpers/createTemporaryFile'
import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

it('respects globs', async function () {
  const pathInFixtures = (dirPath: string): string =>
    pathResolve(__dirname, '..', 'fixtures', 'glob-test', dirPath)
  const { status, stdout, stderr } = await runCodemodCLI([
    '--dry',
    pathInFixtures('**/*.js'),
    `!${pathInFixtures('omit.js')}`,
  ])

  expect(status).toEqual(0)
  expect(stdout).toEqual(expect.stringContaining('abc.js'))
  expect(stdout).toEqual(expect.stringContaining('subdir/def.js'))
  expect(stdout).not.toEqual(expect.stringContaining('omit.js'))
  expect(stderr).toEqual('')
})

it('can read from stdin and write to stdout given the --stdio flag', async function () {
  expect(await runCodemodCLI(['--stdio'], { stdin: '3+4' })).toEqual({
    status: 0,
    stdout: '3+4',
    stderr: '',
  })
})

it('reads from a file, processes with plugins, then writes to that file', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([afile, '-p', plugin('increment')], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
})

it('processes all matching files in a directory', async function () {
  const [file1, file2, file3, ignored] = await createTemporaryFiles(
    ['file1.js', '3 + 4;'],
    ['file2.ts', '0;'],
    ['sub-dir/file3.jsx', '99;'],
    ['ignored.css', '* {}']
  )
  expect(
    await runCodemodCLI([dirname(file1), '-p', plugin('increment')], {
      cwd: dirname(file1),
    })
  ).toEqual({
    status: 0,
    stdout: `${file1}\n${file2}\n${file3}\n3 file(s), 3 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(file1, 'utf8')).toEqual('4 + 5;')
  expect(await fs.readFile(file2, 'utf8')).toEqual('1;')
  expect(await fs.readFile(file3, 'utf8')).toEqual('100;')
  expect(await fs.readFile(ignored, 'utf8')).toEqual('* {}')
})

it('prints files not processed in dim colors', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(await runCodemodCLI([afile], { cwd: dirname(afile) })).toEqual({
    status: 0,
    stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('3 + 4;')
})

it('can rewrite TypeScript files ending in `.ts`', async function () {
  const afile = await createTemporaryFile(
    'a-file.ts',
    'type A = any;\nlet a = {} as any;'
  )
  expect(
    await runCodemodCLI(
      [afile, '-p', plugin('replace-any-with-object', '.ts')],
      { cwd: dirname(afile) }
    )
  ).toEqual({
    status: 0,
    stdout: `${afile}\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })

  expect(await fs.readFile(afile, 'utf8')).toEqual(
    'type A = object;\nlet a = {} as object;'
  )
})

it('can rewrite TypeScript files ending in `.tsx`', async function () {
  const afile = await createTemporaryFile(
    'a-file.tsx',
    'export default () => (<div/>);'
  )
  expect(await runCodemodCLI([afile], { cwd: dirname(afile) })).toEqual({
    status: 0,
    stdout: `${afile}\n1 file(s), 0 modified, 0 errors\n`,
    stderr: '',
  })

  expect(await fs.readFile(afile, 'utf8')).toEqual(
    'export default () => (<div/>);'
  )
})

it('can pass options to a plugin without naming it', async function () {
  expect(
    await runCodemodCLI(
      [
        '--plugin',
        plugin('append-options-string', '.ts'),
        '--plugin-options',
        `${JSON.stringify({ a: 4 })}`,
        '--stdio',
      ],
      { stdin: '' }
    )
  ).toEqual({
    status: 0,
    stdout: `${JSON.stringify(JSON.stringify({ a: 4 }))};`,
    stderr: '',
  })
})
