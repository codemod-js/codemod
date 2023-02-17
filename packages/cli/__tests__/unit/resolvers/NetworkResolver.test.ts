import { promises as fs } from 'fs'
import { NetworkResolver } from '../../../src/resolvers/NetworkResolver'
import { startServer } from '../../helpers/TestServer'

test('can load data from a URL', async function () {
  const server = await startServer((req, res) => {
    res.end('here you go!')
  })

  try {
    const resolver = new NetworkResolver()
    const url = server.requestURL('/gimme')

    expect(await resolver.canResolve(url.toString())).toBeTruthy()

    const filename = await resolver.resolve(url.toString())

    expect(await fs.readFile(filename, { encoding: 'utf8' })).toEqual(
      'here you go!'
    )
  } finally {
    await server.stop()
  }
})

test('only resolves absolute HTTP URLs', async function () {
  const resolver = new NetworkResolver()

  expect(await resolver.canResolve('http://example.com/')).toBeTruthy()
  expect(await resolver.canResolve('https://example.com/')).toBeTruthy()
  expect(await resolver.canResolve('/')).toBeFalsy()
  expect(
    await resolver.canResolve('afp://192.168.0.1/volume/folder/file.js')
  ).toBeFalsy()
  expect(await resolver.canResolve('data:,Hello%2C%20World!')).toBeFalsy()
})

test('follows redirects', async function () {
  const server = await startServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(302, { Location: '/plugin' })
      res.end()
    } else if (req.url === '/plugin') {
      res.end('redirected successfully!')
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  try {
    const resolver = new NetworkResolver()
    const filename = await resolver.resolve(server.requestURL('/').toString())

    expect(await fs.readFile(filename, { encoding: 'utf8' })).toEqual(
      'redirected successfully!'
    )
  } finally {
    await server.stop()
  }
})

test('throws if it gets a non-200 response', async function () {
  const server = await startServer((req, res) => {
    res.statusCode = 400
    res.end()
  })

  try {
    const resolver = new NetworkResolver()
    const url = server.requestURL('/')

    await expect(resolver.resolve(url.toString())).rejects.toThrowError(
      'Response code 400 (Bad Request)'
    )
  } finally {
    await server.stop()
  }
})
