import * as globby from 'globby';
import { join } from 'path';
import check = require('prettier-check');

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  const paths = await globby(['packages/*/{src,test}/**/*.ts', '**/*.md'], {
    cwd: join(__dirname, '../..'),
    gitignore: true
  });

  return await check(paths);
}
