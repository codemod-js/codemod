import { extname, join } from 'path';
import { EntryType, RealSystem, System } from './System';
import { Source } from './TransformRunner';

export type PathPredicate = (
  path: string,
  basename: string,
  root: string,
  type: EntryType
) => boolean;

/**
 * Builds an iterator that loops through all the files in the given paths,
 * matching a whitelist of extensions and not matched by the ignore predicate.
 */
export default function* iterateSources(
  paths: Array<string>,
  extensions: Set<string> | null,
  ignore: PathPredicate,
  sys: System = RealSystem
): IterableIterator<Source> {
  for (let path of paths) {
    let type = sys.getEntryType(path);

    if (type === EntryType.Directory) {
      for (let child of sys.readdir(path)) {
        let childPath = join(path, child);
        let childType = sys.getEntryType(childPath);

        if (ignore(childPath, child, path, childType)) {
          continue;
        }

        if (childType === EntryType.File) {
          if (!extensions || extensions.has(extname(child))) {
            yield* iterateSources([childPath], extensions, ignore, sys);
          }
        } else if (childType === EntryType.Directory) {
          yield* iterateSources([childPath], extensions, ignore, sys);
        }
      }
    } else if (type === EntryType.File) {
      yield new Source(path, sys.readFile(path, 'utf8'));
    }
  }
}
