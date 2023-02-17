import { dirname, join } from 'path'
import { iterateSources } from '../../src/iterateSources'
import createTemporaryDirectory from '../helpers/createTemporaryDirectory'
import createTemporaryFile, {
  createTemporaryFiles,
} from '../helpers/createTemporaryFile'

async function asyncCollect<T>(iter: AsyncIterable<T>): Promise<Array<T>> {
  const result: Array<T> = []
  for await (const element of iter) {
    result.push(element)
  }
  return result
}

test('empty directory', async () => {
  const dir = await createTemporaryDirectory()
  expect(await asyncCollect(iterateSources([dir]))).toEqual([])
})

test('single file', async () => {
  const file = await createTemporaryFile('a-file', 'with contents')
  expect(await asyncCollect(iterateSources([dirname(file)]))).toEqual([
    {
      path: file,
      content: 'with contents',
    },
  ])
})

test('selecting extensions', async () => {
  const [js] = await createTemporaryFiles(
    ['js-files/file.js', 'JS file'],
    ['ts-files/file.ts', 'TS file']
  )
  const root = dirname(dirname(js))
  expect(
    await asyncCollect(iterateSources([root], { extensions: new Set(['.js']) }))
  ).toEqual([
    {
      path: js,
      content: 'JS file',
    },
  ])
})

test('globbing', async () => {
  const paths = await createTemporaryFiles(
    ['main.ts', 'export default 0'],
    ['main.js', 'module.exports.default = 0'],
    ['subdir/index.test.ts', ''],
    ['subdir/utils.ts', ''],
    ['subdir/utils.test.ts', ''],
    ['subdir/.gitignore', 'ignored.test.ts'],
    ['subdir/ignored.test.ts', ''],
    ['.git/config', '']
  )

  expect(
    await asyncCollect(
      iterateSources(['**/*.test.ts'], { cwd: dirname(paths[0]) })
    )
  ).toEqual(
    paths
      .filter((path) => path.endsWith('.test.ts') && !path.includes('ignored'))
      .map((path) =>
        expect.objectContaining({
          path,
        })
      )
  )
})

test('gitignore', async () => {
  const [main] = await createTemporaryFiles(
    ['main.ts', 'export default 0'],
    ['.git/config', ''],
    ['.gitignore', '*.d.ts'],
    ['ignored.d.ts', ''],
    ['subdir/.gitignore', '*.js'],
    ['subdir/ignored-by-root.d.ts', ''],
    ['subdir/ignored-by-subdir.js', ''],
    ['subdir/subdir2/.gitignore', ''],
    ['subdir/subdir2/ignored-by-root.d.ts', ''],
    ['subdir/subdir2/ignored-by-subdir.js', '']
  )

  const root = dirname(main)
  expect(await asyncCollect(iterateSources([root]))).toEqual([
    { path: main, content: 'export default 0' },
  ])

  const subdir = join(root, 'subdir')
  expect(await asyncCollect(iterateSources([subdir]))).toEqual([])
})
