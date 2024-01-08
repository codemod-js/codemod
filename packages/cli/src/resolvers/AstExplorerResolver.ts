import { promises as fs } from 'fs'
import { URL } from 'url'
import { NetworkResolver } from './NetworkResolver'

const EDITOR_HASH_PATTERN = /^#\/gist\/(\w+)(?:\/(\w+))?$/

/**
 * Resolves plugins from AST Explorer transforms.
 *
 * astexplorer.net uses GitHub gists to save and facilitate sharing. This
 * resolver accepts either the editor URL or the gist API URL.
 */
export class AstExplorerResolver extends NetworkResolver {
  constructor(
    private readonly baseURL: URL = new URL('https://astexplorer.net/'),
  ) {
    super()
  }

  async canResolve(source: string): Promise<boolean> {
    if (await super.canResolve(source)) {
      const url = new URL(await this.normalize(source))
      const canResolve =
        this.matchesHost(url) &&
        /^\/api\/v1\/gist\/[a-f0-9]+(\/(?:[a-f0-9]+|latest))?$/.test(
          url.pathname,
        )
      return canResolve
    }

    return false
  }

  async resolve(source: string): Promise<string> {
    const filename = await super.resolve(await this.normalize(source))
    const text = await fs.readFile(filename, { encoding: 'utf8' })
    let data

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(
        `data loaded from ${source} is not JSON: ${text.slice(0, 100)}`,
      )
    }

    if (
      !data ||
      !data.files ||
      !data.files['transform.js'] ||
      !data.files['transform.js'].content
    ) {
      throw new Error(
        "'transform.js' could not be found, perhaps transform is disabled",
      )
    }

    await fs.writeFile(filename, data.files['transform.js'].content, {
      encoding: 'utf8',
    })

    return filename
  }

  async normalize(source: string): Promise<string> {
    const url = new URL(source)

    if (!this.matchesHost(url)) {
      return source
    }

    const match = url.hash.match(EDITOR_HASH_PATTERN)

    if (!match) {
      return source
    }

    let path = `/api/v1/gist/${match[1]}`

    if (match[2]) {
      path += `/${match[2]}`
    }

    return new URL(path, this.baseURL).toString()
  }

  private matchesHost(url: URL): boolean {
    if (url.host !== this.baseURL.host) {
      return false
    }

    // use SSL even if the URL doesn't use it
    return url.protocol === this.baseURL.protocol || url.protocol === 'http:'
  }
}
