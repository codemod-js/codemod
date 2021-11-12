import { get, Response } from 'got'
import * as fs from 'fs'
import { tmpNameSync as tmp } from 'tmp'
import { URL } from 'url'
import Resolver from './Resolver'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

export class NetworkLoadError extends Error {
  constructor(readonly response: Response<string>) {
    super(`failed to load plugin from '${response.url}'`)
  }
}

/**
 * Resolves plugins over the network to a local file.
 *
 * This plugin accepts only absolute HTTP URLs.
 */
export default class NetworkResolver implements Resolver {
  async canResolve(source: string): Promise<boolean> {
    try {
      const url = new URL(source)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  async resolve(source: string): Promise<string> {
    const response = await get(source, { followRedirect: true })

    if (response.statusCode !== 200) {
      throw new NetworkLoadError(response)
    }

    const filename = tmp({ postfix: '.js' })
    await writeFile(filename, response.body)
    return filename
  }
}
