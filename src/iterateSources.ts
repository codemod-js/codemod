import { readdirSync, readFileSync, statSync, Stats } from 'fs';
import { extname, join } from 'path';
import { Source } from './TransformRunner';

export type PathPredicate = (path: string, basename: string, root: string, stat: Stats) => boolean;

/**
 * Builds an iterator that loops through all the files in the given paths,
 * matching a whitelist of extensions and not matched by the ignore predicate.
 */
export default function *iterateSources(paths: Array<string>, extensions: Set<string>, ignore: PathPredicate): IterableIterator<Source> {
  for (let path of paths) {
    let stats = statSync(path);

    if (stats.isDirectory()) {
      for (let child of readdirSync(path)) {
        let childPath = join(path, child);
        let childStat = statSync(childPath);

        if (ignore(childPath, child, path, childStat)) {
          continue;
        }

        if (childStat.isFile()) {
          if (extensions.has(extname(child))) {
            yield *iterateSources([childPath], extensions, ignore);
          }
        } else if (childStat.isDirectory()) {
          yield *iterateSources([childPath], extensions, ignore);
        }
      }
    } else if (stats.isFile()) {
      yield new Source(path, readFileSync(path, { encoding: 'utf8' }));
    }
  }
}
