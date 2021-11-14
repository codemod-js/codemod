import { promises as fs } from 'fs'
import { dirname, join } from 'path'
import tempy = require('tempy')
import createTemporaryDirectory from './createTemporaryDirectory'

export default async function createTemporaryFile(
  name: string,
  content: string
): Promise<string> {
  const fullPath = tempy.file({ name })
  await fs.writeFile(fullPath, content, 'utf8')
  return fullPath
}

export async function createTemporaryFiles(
  ...files: Array<[name: string, content: string]>
): Promise<Array<string>> {
  const root = await createTemporaryDirectory()

  return Promise.all(
    files.map(async ([name, content]) => {
      const fullPath = join(root, name)
      await fs.mkdir(dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content)
      return fullPath
    })
  )
}
