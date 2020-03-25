import * as fs from 'fs'
import { basename, dirname, join } from 'path'
import createTemporaryDirectory from './createTemporaryDirectory'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

export default async function createTemporaryFile(
  path: string,
  content: string
): Promise<string> {
  const fullPath = join(
    await createTemporaryDirectory(dirname(path)),
    basename(path)
  )
  await writeFile(fullPath, content, 'utf8')
  return fullPath
}
