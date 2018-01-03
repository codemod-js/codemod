import { readFile, writeFile } from 'mz/fs';
import { URL } from 'whatwg-url';
import NetworkResolver from './NetworkResolver';

const EDITOR_HASH_PATTERN = /^#\/gist\/(\w+)(?:\/(\w+))?$/;

/**
 * Resolves plugins from AST Explorer transforms.
 *
 * astexplorer.net uses GitHub gists to save and facilitate sharing. This
 * resolver accepts either the editor URL or the gist API URL.
 */
export default class AstExplorerResolver extends NetworkResolver {
  constructor(
    private readonly baseURL: URL = new URL('https://astexplorer.net/')
  ) {
    super();
  }

  async canResolve(source: string): Promise<boolean> {
    if (await super.canResolve(source)) {
      let url = new URL(await this.normalize(source));

      return (
        this.matchesHost(url) &&
        /^\/api\/v1\/gist\/[a-f0-9]+(\/[a-f0-9]+)?$/.test(url.pathname)
      );
    }

    return false;
  }

  async resolve(source: string): Promise<string> {
    let filename = await super.resolve(await this.normalize(source));
    let text = await readFile(filename, { encoding: 'utf8' });
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `data loaded from ${source} is not JSON: ${text.slice(0, 100)}`
      );
    }

    if (
      !data ||
      !data.files ||
      !data.files['transform.js'] ||
      !data.files['transform.js'].content
    ) {
      throw new Error(
        "'transform.js' could not be found, perhaps transform is disabled"
      );
    }

    await writeFile(filename, data.files['transform.js'].content, {
      encoding: 'utf8'
    });

    return filename;
  }

  async normalize(source: string): Promise<string> {
    let url = new URL(source);

    if (!this.matchesHost(url)) {
      return source;
    }

    let match = url.hash.match(EDITOR_HASH_PATTERN);

    if (!match) {
      return source;
    }

    let path = `/api/v1/gist/${match[1]}`;

    if (match[2]) {
      path += `/${match[2]}`;
    }

    return new URL(path, this.baseURL).toString();
  }

  private matchesHost(url: URL): boolean {
    return (
      url.protocol === this.baseURL.protocol && url.host === this.baseURL.host
    );
  }
}
