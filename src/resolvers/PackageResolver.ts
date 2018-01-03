import { sync as resolveSync } from 'resolve';
import Resolver from './Resolver';

/**
 * Resolves node modules by name relative to the working directory.
 *
 * For example, if used in a project that includes `myplugin` in its
 * `node_modules`, this class will resolve to the main file of `myplugin`.
 */
export default class PackageResolver implements Resolver {
  async canResolve(source: string): Promise<boolean> {
    try {
      await this.resolve(source);
      return true;
    } catch {
      return false;
    }
  }

  async resolve(source: string): Promise<string> {
    return resolveSync(source, { basedir: process.cwd() });
  }
}
