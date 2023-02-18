import { promises as fs } from 'fs'
import { fetch } from 'cross-fetch'
import { tmpNameSync as tmp } from 'tmp'
import { URL } from 'url'
import Resolver from './Resolver'

export class NetworkLoadError extends Error {
  constructor(readonly response: Response) {
    super(`failed to load plugin from '${response.url}'`)
  }
}

/**
 * Resolves plugins over the network to a local file.
 *
 * This plugin accepts only absolute HTTP URLs.
 */
export class NetworkResolver implements Resolver {
  async canResolve(source: string): Promise<boolean> {
    try {
      const url = new URL(source)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  async resolve(source: string): Promise<string> {
    const response = await fetch(source, { redirect: 'follow' })

    if (response.status !== 200) {
      throw new NetworkLoadError(response)
    }

    const filename = tmp({ postfix: '.js' })
    await fs.writeFile(filename, await response.text())
    return filename
  }
}
