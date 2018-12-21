import runInPackages from '../_utils/runInPackages';
import runInDirectory from '../_utils/runInDirectory';

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<void> {
  await runInDirectory(
    stdin,
    stdout,
    stderr,
    '.',
    'npm',
    ['install', '-g', 'semantic-release', 'semantic-release-monorepo']
  );
  await runInPackages(
    stdin,
    stdout,
    stderr,
    'semantic-release',
    ['-e', 'semantic-release-monorepo']
  );
}
