import { sync } from 'globby'
import { extname } from 'path'
import { RealSystem, System } from './System'
import { Source } from './TransformRunner'

/**
 * Builds an iterator that loops through all the files in the given paths,
 * matching a whitelist of extensions and not matched by the ignore predicate.
 */
export default function iterateSources(
  paths: Array<string>,
  extensions: Set<string> | null = null,
  sys: System = RealSystem
): Array<Source> {
  return sync(paths, {
    gitignore: true,
  })
    .filter((file) => !extensions || extensions.has(extname(file)))
    .map((file) => new Source(file, sys.readFile(file, 'utf8')))
}
