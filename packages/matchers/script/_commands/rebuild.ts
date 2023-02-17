import { promises as fs } from 'fs'
import { rebuild, MATCHERS_FILE_PATH } from '../_utils/rebuild'

export async function main(): Promise<number> {
  await fs.writeFile(MATCHERS_FILE_PATH, await rebuild(), 'utf8')

  return 0
}
