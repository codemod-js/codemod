import { mkdir } from 'mz/fs';
import { basename, dirname } from 'path';

export default async function mkdirp(path: string): Promise<void> {
  let parent = dirname(path);
  let name = basename(path);

  if (parent === '.' || parent === '/') {
    try {
      await mkdir(name);
    } catch (err) {}
  } else {
    await mkdirp(parent);
    try {
      await mkdir(path);
    } catch (err) {}
  }
}
