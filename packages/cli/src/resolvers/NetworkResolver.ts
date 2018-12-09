import { get, Response } from 'got';
import { writeFile } from 'mz/fs';
import { tmpNameSync as tmp } from 'tmp';
import { URL } from 'whatwg-url';
import Resolver from './Resolver';

export class NetworkLoadError extends Error {
  constructor(readonly response: Response<string>) {
    super(`failed to load plugin from '${response.url}'`);
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
      let url = new URL(source);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async resolve(source: string): Promise<string> {
    let response = await get(source, { followRedirect: true });

    if (response.statusCode !== 200) {
      throw new NetworkLoadError(response);
    }

    let filename = tmp({ postfix: '.js' });
    await writeFile(filename, response.body);
    return filename;
  }
}
