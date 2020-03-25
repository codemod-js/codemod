import runInPackages from '../_utils/runInPackages'
import runInSequence from '../_utils/runInSequence'
import runExternalCommand from '../_utils/runExternalCommand'
import { join } from 'path'

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  return await runInSequence(
    async () =>
      await runExternalCommand(
        'script/lint-commits',
        [],
        join(__dirname, '../..'),
        stdin,
        stdout,
        stderr
      ),
    async () => (
      await runInPackages(stdin, stdout, stderr, 'script/ci', args), 0
    )
  )
}
