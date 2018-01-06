import { readdirSync, readFileSync, statSync, Stats } from 'fs';
import { extname, join } from 'path';
import { Source } from './TransformRunner';

export type PathPredicate = (
  path: string,
  basename: string,
  root: string,
  stat: Stats
) => boolean;

/**
 * Builds an iterator that loops through all the files in the given paths,
 * matching a whitelist of extensions and not matched by the ignore predicate.
 */
export default function* iterateSources(
  paths: Array<string>,
  extensions: Set<string>,
  ignore: PathPredicate,
  statSyncImpl: typeof statSync = statSync,
  readdirSyncImpl: typeof readdirSync = readdirSync,
  readFileSyncImpl: typeof readFileSync = readFileSync
): IterableIterator<Source> {
  for (let path of paths) {
    let stats = statSyncImpl(path);

    if (stats.isDirectory()) {
      for (let child of readdirSyncImpl(path)) {
        let childPath = join(path, child);
        let childStat = statSyncImpl(childPath);

        if (ignore(childPath, child, path, childStat)) {
          continue;
        }

        if (childStat.isFile()) {
          if (extensions.has(extname(child))) {
            yield* iterateSources(
              [childPath],
              extensions,
              ignore,
              statSyncImpl,
              readdirSyncImpl,
              readFileSyncImpl
            );
          }
        } else if (childStat.isDirectory()) {
          yield* iterateSources(
            [childPath],
            extensions,
            ignore,
            statSyncImpl,
            readdirSyncImpl,
            readFileSyncImpl
          );
        }
      }
    } else if (stats.isFile()) {
      yield new Source(path, readFileSyncImpl(path, { encoding: 'utf8' }));
    }
  }
}
