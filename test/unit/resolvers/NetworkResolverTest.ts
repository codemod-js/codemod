import { ok, strictEqual } from 'assert';
import { readFile } from 'mz/fs';
import NetworkResolver from '../../../src/resolvers/NetworkResolver';
import { startServer } from '../TestServer';

describe('NetworkResolver', function() {
  it('can load data from a URL', async function() {
    let server = await startServer((req, res) => {
      res.end('here you go!');
    });

    try {
      let resolver = new NetworkResolver();
      let url = server.requestURL('/gimme');

      ok(
        await resolver.canResolve(url.toString()),
        `can load from URL: ${url}`
      );

      let filename = await resolver.resolve(url.toString());

      strictEqual(
        await readFile(filename, { encoding: 'utf8' }),
        'here you go!'
      );
    } finally {
      await server.stop();
    }
  });

  it('only resolves absolute HTTP URLs', async function() {
    let resolver = new NetworkResolver();

    ok(await resolver.canResolve('http://example.com/'));
    ok(await resolver.canResolve('https://example.com/'));
    ok(!await resolver.canResolve('/'));
    ok(!await resolver.canResolve('afp://192.168.0.1/volume/folder/file.js'));
    ok(!await resolver.canResolve('data:,Hello%2C%20World!'));
  });

  it('follows redirects', async function() {
    let server = await startServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(302, { Location: '/plugin' });
        res.end();
      } else if (req.url === '/plugin') {
        res.end('redirected successfully!');
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    try {
      let resolver = new NetworkResolver();
      let filename = await resolver.resolve(server.requestURL('/').toString());

      strictEqual(
        await readFile(filename, { encoding: 'utf8' }),
        'redirected successfully!'
      );
    } finally {
      await server.stop();
    }
  });

  it('throws if it gets a non-200 response', async function() {
    let server = await startServer((req, res) => {
      res.statusCode = 400;
      res.end();
    });

    try {
      let resolver = new NetworkResolver();
      let url = server.requestURL('/');

      await resolver.resolve(url.toString());

      ok(false, 'expected resolution to fail');
    } catch (err) {
      strictEqual(err.message, 'Response code 400 (Bad Request)');
    } finally {
      await server.stop();
    }
  });
});
