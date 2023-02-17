import { promises as fs } from 'fs'
import { dirname, join, relative } from 'path'
import { iterateSources } from '../../src/iterateSources'
import mkdirp = require('make-dir')

export default async function copyFixturesInto(
  fixture: string,
  destination: string
): Promise<string> {
  const fixturePath = join('test/fixtures', fixture)

  for await (const file of iterateSources([fixturePath])) {
    const relativePath = relative(fixturePath, file.path)
    const destinationPath = join(destination, relativePath)
    await mkdirp(dirname(destinationPath))
    await fs.writeFile(destinationPath, file.content)
  }

  return destination
}
