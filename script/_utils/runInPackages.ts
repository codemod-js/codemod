import * as globby from 'globby';
import { readFile } from 'mz/fs';
import { join } from 'path';
import runInDirectory from './runInDirectory';

export default async function runInPackages(
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  command: string,
  args: Array<string> = [],
  packages?: Array<string>
): Promise<void> {
  for (const pkg of await (packages || findPackages())) {
    await runInDirectory(stdin, stdout, stderr, pkg, command, args);
  }
}

async function findPackages(): Promise<Array<string>> {
  const globs = JSON.parse(await readFile(join(__dirname, '../../package.json'), 'utf8')).workspaces;
  return await globby(globs, { onlyDirectories: true });
}
