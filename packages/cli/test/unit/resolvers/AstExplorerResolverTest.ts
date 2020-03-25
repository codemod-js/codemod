import { ok, strictEqual } from 'assert'
import * as fs from 'fs'
import { join } from 'path'
import AstExplorerResolver from '../../../src/resolvers/AstExplorerResolver'
import { startServer } from '../../helpers/TestServer'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

describe('AstExplorerResolver', function () {
  it('normalizes a gist+commit editor URL into an API URL', async function () {
    const resolver = new AstExplorerResolver()
    const normalized = await resolver.normalize(
      'https://astexplorer.net/#/gist/688274/5ece95'
    )

    strictEqual(normalized, 'https://astexplorer.net/api/v1/gist/688274/5ece95')
  })

  it('normalizes http gist+commit editor URL to an https API URL', async function () {
    const resolver = new AstExplorerResolver()
    const normalized = await resolver.normalize(
      'http://astexplorer.net/#/gist/b5b33c/f9ae8a'
    )

    strictEqual(normalized, 'https://astexplorer.net/api/v1/gist/b5b33c/f9ae8a')
  })

  it('normalizes a gist-only editor URL into an API URL', async function () {
    const resolver = new AstExplorerResolver()
    const normalized = await resolver.normalize(
      'https://astexplorer.net/#/gist/688274'
    )

    strictEqual(normalized, 'https://astexplorer.net/api/v1/gist/688274')
  })

  it('extracts the transform from the editor view', async function () {
    const result = await readFile(
      join(__dirname, '../../fixtures/astexplorer/default.json'),
      { encoding: 'utf8' }
    )
    const server = await startServer((req, res) => {
      res.end(result)
    })

    try {
      const resolver = new AstExplorerResolver(server.requestURL('/'))
      strictEqual(
        await readFile(
          await resolver.resolve(
            server.requestURL('/#/gist/abc/def').toString()
          ),
          { encoding: 'utf8' }
        ),
        JSON.parse(result).files['transform.js'].content
      )
    } finally {
      await server.stop()
    }
  })

  it('fails when returned data is not JSON', async function () {
    const server = await startServer((req, res) => {
      res.end('this is not JSON')
    })
    const url = server.requestURL('/')

    try {
      const resolver = new AstExplorerResolver(server.requestURL('/'))

      await resolver.resolve(url.toString())

      ok(false, 'resolution to non-JSON data should have failed')
    } catch (err) {
      strictEqual(
        err.message,
        `data loaded from ${url} is not JSON: this is not JSON`
      )
    } finally {
      await server.stop()
    }
  })

  it('fails when files data is not present', async function () {
    const server = await startServer((req, res) => {
      res.end(JSON.stringify({}))
    })

    try {
      const resolver = new AstExplorerResolver(server.requestURL('/'))

      await resolver.resolve(server.requestURL('/').toString())

      ok(false, 'resolution to data without files should have failed')
    } catch (err) {
      strictEqual(
        err.message,
        "'transform.js' could not be found, perhaps transform is disabled"
      )
    } finally {
      await server.stop()
    }
  })

  it('fails when transform.js is not present', async function () {
    const server = await startServer((req, res) => {
      res.end(JSON.stringify({ files: {} }))
    })

    try {
      const resolver = new AstExplorerResolver(server.requestURL('/'))

      await resolver.resolve(server.requestURL('/').toString())

      ok(
        false,
        'resolution to data without transform.js file should have failed'
      )
    } catch (err) {
      strictEqual(
        err.message,
        "'transform.js' could not be found, perhaps transform is disabled"
      )
    } finally {
      await server.stop()
    }
  })
})
