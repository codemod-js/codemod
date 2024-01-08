import { promises as fs } from 'fs'
import { join } from 'path'
import { AstExplorerResolver } from '../../../src/resolvers/AstExplorerResolver'
import { startServer } from '../../helpers/TestServer'

test('normalizes a gist+commit editor URL into an API URL', async function () {
  const resolver = new AstExplorerResolver()
  const normalized = await resolver.normalize(
    'https://astexplorer.net/#/gist/688274/5ece95',
  )

  expect(normalized).toEqual(
    'https://astexplorer.net/api/v1/gist/688274/5ece95',
  )
})

test('normalizes http gist+commit editor URL to an https API URL', async function () {
  const resolver = new AstExplorerResolver()
  const normalized = await resolver.normalize(
    'http://astexplorer.net/#/gist/b5b33c/f9ae8a',
  )

  expect(normalized).toEqual(
    'https://astexplorer.net/api/v1/gist/b5b33c/f9ae8a',
  )
})

test('normalizes a gist-only editor URL into an API URL', async function () {
  const resolver = new AstExplorerResolver()
  const normalized = await resolver.normalize(
    'https://astexplorer.net/#/gist/688274',
  )

  expect(normalized).toEqual('https://astexplorer.net/api/v1/gist/688274')
})

test('normalizes a gist+latest editor URL into an API URL', async function () {
  const resolver = new AstExplorerResolver()
  const normalized = await resolver.normalize(
    'https://astexplorer.net/#/gist/688274/latest',
  )

  expect(normalized).toEqual(
    'https://astexplorer.net/api/v1/gist/688274/latest',
  )
})

test('extracts the transform from the editor view', async function () {
  const result = await fs.readFile(
    join(__dirname, '../../fixtures/astexplorer/default.json'),
    { encoding: 'utf8' },
  )
  const server = await startServer((req, res) => {
    res.end(result)
  })

  try {
    const resolver = new AstExplorerResolver(server.requestURL('/'))
    expect(
      await fs.readFile(
        await resolver.resolve(server.requestURL('/#/gist/abc/def').toString()),
        { encoding: 'utf8' },
      ),
    ).toEqual(JSON.parse(result).files['transform.js'].content)
  } finally {
    await server.stop()
  }
})

test('fails when returned data is not JSON', async function () {
  const server = await startServer((req, res) => {
    res.end('this is not JSON')
  })
  const url = server.requestURL('/')

  try {
    const resolver = new AstExplorerResolver(server.requestURL('/'))

    await expect(resolver.resolve(url.toString())).rejects.toThrowError(
      `data loaded from ${url} is not JSON: this is not JSON`,
    )
  } finally {
    await server.stop()
  }
})

test('fails when files data is not present', async function () {
  const server = await startServer((req, res) => {
    res.end(JSON.stringify({}))
  })

  try {
    const resolver = new AstExplorerResolver(server.requestURL('/'))

    await expect(
      resolver.resolve(server.requestURL('/').toString()),
    ).rejects.toThrowError(
      "'transform.js' could not be found, perhaps transform is disabled",
    )
  } finally {
    await server.stop()
  }
})

test('fails when transform.js is not present', async function () {
  const server = await startServer((req, res) => {
    res.end(JSON.stringify({ files: {} }))
  })

  try {
    const resolver = new AstExplorerResolver(server.requestURL('/'))

    await expect(
      resolver.resolve(server.requestURL('/').toString()),
    ).rejects.toThrowError(
      "'transform.js' could not be found, perhaps transform is disabled",
    )
  } finally {
    await server.stop()
  }
})
