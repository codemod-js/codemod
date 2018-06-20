import { stat } from 'mz/fs';
import { resolve } from 'path';
import { PluginExtensions } from '../extensions';
import Resolver from './Resolver';

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolves file system paths to plugins.
 */
export default class FileSystemResolver implements Resolver {
  constructor(
    private readonly optionalExtensions: Set<string> = PluginExtensions
  ) {}

  private *enumerateCandidateSources(source: string): IterableIterator<string> {
    yield resolve(source);

    for (let ext of this.optionalExtensions) {
      if (ext[0] !== '.') {
        yield resolve(`${source}.${ext}`);
      } else {
        yield resolve(source + ext);
      }
    }
  }

  async canResolve(source: string): Promise<boolean> {
    for (let candidate of this.enumerateCandidateSources(source)) {
      if (await isFile(candidate)) {
        return true;
      }
    }

    return false;
  }

  async resolve(source: string): Promise<string> {
    for (let candidate of this.enumerateCandidateSources(source)) {
      if (await isFile(candidate)) {
        return candidate;
      }
    }

    throw new Error(`unable to resolve file from source: ${source}`);
  }
}
