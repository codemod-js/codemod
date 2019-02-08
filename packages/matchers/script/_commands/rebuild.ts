import rebuild, { MATCHERS_FILE_PATH } from '../_utils/rebuild';
import { createWriteStream } from 'fs';

export default function main(): Promise<number> {
  return new Promise(resolve => {
    const out = createWriteStream(MATCHERS_FILE_PATH, 'utf8');
    out.once('close', () => resolve(0));
    rebuild(out);
  });
}
