import { writeFile } from 'mz/fs';
import { basename, dirname, join } from 'path';
import createTemporaryDirectory from './createTemporaryDirectory';

export default async function createTemporaryFile(
  path: string,
  content: string
): Promise<string> {
  const fullPath = join(
    await createTemporaryDirectory(dirname(path)),
    basename(path)
  );
  await writeFile(fullPath, content, 'utf8');
  return fullPath;
}
