import { writeFile } from 'mz/fs';
import { dirname } from 'path';
import getTemporaryFilePath from './getTemporaryFilePath';
import mkdirp from './mkdirp';

// TODO: Use `tmp` to generate a temporary directory?
export default async function createTemporaryFile(
  path: string,
  content: string
): Promise<string> {
  let fullPath = getTemporaryFilePath(path);

  await mkdirp(dirname(fullPath));
  await writeFile(fullPath, content, 'utf8');

  return fullPath;
}
