import runInPackages from '../_utils/runInPackages';

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<void> {
  await runInPackages(stdin, stdout, stderr, 'script/ci', args);
}
