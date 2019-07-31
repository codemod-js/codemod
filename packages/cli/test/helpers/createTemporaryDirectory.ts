import mkdirp = require('make-dir');
import getTemporaryFilePath from './getTemporaryFilePath';

export default async function createTemporaryDirectory(
  path: string
): Promise<string> {
  const fullPath = getTemporaryFilePath(path);
  await mkdirp(fullPath);
  return fullPath;
}
