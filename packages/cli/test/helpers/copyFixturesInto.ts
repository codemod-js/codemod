import mkdirp = require('make-dir');
import { writeFile } from 'mz/fs';
import { dirname, join, relative } from 'path';
import iterateSources from '../../src/iterateSources';

export default async function copyFixturesInto(
  fixture: string,
  destination: string
): Promise<string> {
  let fixturePath = join('test/fixtures', fixture);

  for (let file of iterateSources([fixturePath], null, () => false)) {
    let relativePath = relative(fixturePath, file.path);
    let destinationPath = join(destination, relativePath);
    await mkdirp(dirname(destinationPath));
    await writeFile(destinationPath, file.content);
  }

  return destination;
}
