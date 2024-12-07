import { promises as fs } from 'node:fs'
import { MATCHERS_FILE_PATH, rebuild } from './utils/rebuild'

export async function main(): Promise<number> {
  await fs.writeFile(MATCHERS_FILE_PATH, await rebuild(), 'utf8')

  return 0
}
