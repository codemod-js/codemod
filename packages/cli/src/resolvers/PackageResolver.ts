import resolve from 'resolve'
import type Resolver from './Resolver'

/**
 * Resolves node modules by name relative to the working directory.
 *
 * For example, if used in a project that includes `myplugin` in its
 * `node_modules`, this class will resolve to the main file of `myplugin`.
 */
export class PackageResolver implements Resolver {
  async canResolve(source: string): Promise<boolean> {
    try {
      await this.resolve(source)
      return true
    } catch {
      return false
    }
  }

  async resolve(source: string): Promise<string> {
    return resolve.sync(source, { basedir: process.cwd() })
  }
}
