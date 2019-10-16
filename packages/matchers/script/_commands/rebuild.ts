import { writeFile as writeFileCallback } from 'fs';
import { promisify } from 'util';
import rebuild, { MATCHERS_FILE_PATH } from '../_utils/rebuild';

const writeFile = promisify(writeFileCallback);

export default async function main(): Promise<number> {
  await writeFile(MATCHERS_FILE_PATH, await rebuild(), 'utf8');

  return 0;
}
