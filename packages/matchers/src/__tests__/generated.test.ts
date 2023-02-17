import { promises as fs } from 'fs'
import { MATCHERS_FILE_PATH, rebuild } from '../../script/_utils/rebuild'

test('generated file is up to date', async () => {
  const existingContent = await fs.readFile(MATCHERS_FILE_PATH, 'utf8')
  const newContent = await rebuild()
  expect(newContent).toEqual(existingContent)
})
