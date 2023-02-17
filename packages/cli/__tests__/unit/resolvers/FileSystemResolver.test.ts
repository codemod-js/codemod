import { join } from 'path'
import { FileSystemResolver } from '../../../src/resolvers/FileSystemResolver'

test('can resolve any files that exist as-is', async function () {
  const resolver = new FileSystemResolver()
  expect(await resolver.canResolve(__filename)).toBeTruthy()
  expect(await resolver.resolve(__filename)).toEqual(__filename)
})

test('can resolve files by inferring an extension from a configurable set of extensions', async function () {
  const resolver = new FileSystemResolver(new Set(['.json']))
  const packageJsonWithoutExtension = join(__dirname, '../../../package')
  expect(await resolver.canResolve(packageJsonWithoutExtension)).toBeTruthy()
  expect(await resolver.resolve(packageJsonWithoutExtension)).toEqual(
    `${packageJsonWithoutExtension}.json`
  )
})

test('can resolve files by inferring an dot-less extension from a configurable set of extensions', async function () {
  const resolver = new FileSystemResolver(new Set(['json']))
  const packageJsonWithoutExtension = join(__dirname, '../../../package')
  expect(await resolver.canResolve(packageJsonWithoutExtension)).toBeTruthy()
  expect(await resolver.resolve(packageJsonWithoutExtension)).toEqual(
    `${packageJsonWithoutExtension}.json`
  )
})

test('fails to resolve a non-existent file', async function () {
  const resolver = new FileSystemResolver()
  expect(!(await resolver.canResolve('/this/file/is/not/there'))).toBeTruthy()

  await expect(
    resolver.resolve('/this/file/is/not/there')
  ).rejects.toThrowError(
    'unable to resolve file from source: /this/file/is/not/there'
  )
})
