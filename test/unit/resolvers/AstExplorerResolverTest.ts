import { ok, strictEqual } from 'assert';
import { readFile } from 'mz/fs';
import { join } from 'path';
import AstExplorerResolver from '../../../src/resolvers/AstExplorerResolver';
import { startServer } from '../../helpers/TestServer';

describe('AstExplorerResolver', function() {
  it('normalizes a gist+commit editor URL into an API URL', async function() {
    let resolver = new AstExplorerResolver();
    let normalized = await resolver.normalize(
      'https://astexplorer.net/#/gist/688274/5ece95'
    );

    strictEqual(
      normalized,
      'https://astexplorer.net/api/v1/gist/688274/5ece95'
    );
  });

  it('normalizes a gist-only editor URL into an API URL', async function() {
    let resolver = new AstExplorerResolver();
    let normalized = await resolver.normalize(
      'https://astexplorer.net/#/gist/688274'
    );

    strictEqual(normalized, 'https://astexplorer.net/api/v1/gist/688274');
  });

  it('extracts the transform from the editor view', async function() {
    let result = await readFile(
      join(__dirname, '../../fixtures/astexplorer/default.json'),
      { encoding: 'utf8' }
    );
    let server = await startServer((req, res) => {
      res.end(result);
    });

    try {
      let resolver = new AstExplorerResolver(server.requestURL('/'));
      strictEqual(
        await readFile(
          await resolver.resolve(
            server.requestURL('/#/gist/abc/def').toString()
          ),
          { encoding: 'utf8' }
        ),
        JSON.parse(result).files['transform.js'].content
      );
    } finally {
      await server.stop();
    }
  });

  it('fails when returned data is not JSON', async function() {
    let server = await startServer((req, res) => {
      res.end('this is not JSON');
    });
    let url = server.requestURL('/');

    try {
      let resolver = new AstExplorerResolver(server.requestURL('/'));

      await resolver.resolve(url.toString());

      ok(false, 'resolution to non-JSON data should have failed');
    } catch (err) {
      strictEqual(
        err.message,
        `data loaded from ${url} is not JSON: this is not JSON`
      );
    } finally {
      await server.stop();
    }
  });

  it('fails when files data is not present', async function() {
    let server = await startServer((req, res) => {
      res.end(JSON.stringify({}));
    });

    try {
      let resolver = new AstExplorerResolver(server.requestURL('/'));

      await resolver.resolve(server.requestURL('/').toString());

      ok(false, 'resolution to data without files should have failed');
    } catch (err) {
      strictEqual(
        err.message,
        "'transform.js' could not be found, perhaps transform is disabled"
      );
    } finally {
      await server.stop();
    }
  });

  it('fails when transform.js is not present', async function() {
    let server = await startServer((req, res) => {
      res.end(JSON.stringify({ files: {} }));
    });

    try {
      let resolver = new AstExplorerResolver(server.requestURL('/'));

      await resolver.resolve(server.requestURL('/').toString());

      ok(
        false,
        'resolution to data without transform.js file should have failed'
      );
    } catch (err) {
      strictEqual(
        err.message,
        "'transform.js' could not be found, perhaps transform is disabled"
      );
    } finally {
      await server.stop();
    }
  });
});
