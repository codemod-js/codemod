import { ok, strictEqual } from 'assert';
import { join } from 'path';
import FileSystemResolver from '../../../src/resolvers/FileSystemResolver';

describe('FileSystemResolver', function() {
  it('can resolve any files that exist as-is', async function() {
    let resolver = new FileSystemResolver();
    ok(await resolver.canResolve(__filename));
    strictEqual(await resolver.resolve(__filename), __filename);
  });

  it('can resolve files by inferring an extension from a configurable set of extensions', async function() {
    let resolver = new FileSystemResolver(new Set(['.lock']));
    let yarnLockWithoutExtension = join(__dirname, '../../../yarn');
    ok(await resolver.canResolve(yarnLockWithoutExtension));
    strictEqual(
      await resolver.resolve(yarnLockWithoutExtension),
      `${yarnLockWithoutExtension}.lock`
    );
  });

  it('can resolve files by inferring an dot-less extension from a configurable set of extensions', async function() {
    let resolver = new FileSystemResolver(new Set(['lock']));
    let yarnLockWithoutExtension = join(__dirname, '../../../yarn');
    ok(await resolver.canResolve(yarnLockWithoutExtension));
    strictEqual(
      await resolver.resolve(yarnLockWithoutExtension),
      `${yarnLockWithoutExtension}.lock`
    );
  });

  it('fails to resolve a non-existent file', async function() {
    let resolver = new FileSystemResolver();
    ok(!await resolver.canResolve('/this/file/is/not/there'));

    try {
      await resolver.resolve('/this/file/is/not/there');
      ok(false, 'resolution to a non-existent file should have failed');
    } catch (err) {
      strictEqual(
        err.message,
        'unable to resolve file from source: /this/file/is/not/there'
      );
    }
  });
});
