import { spawn } from 'child_process'

export default async function runExternalCommand(
  command: string,
  args: ReadonlyArray<string>,
  cwd: string,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  env?: NodeJS.ProcessEnv
): Promise<number> {
  return new Promise((resolve, reject) => {
    stdout.write(`\x1b[38;5;8m$ ${command} ${args.join(' ')}\x1b[0m\n`)
    const proc = spawn(command, args, {
      cwd,
      stdio: [stdin, stdout, stderr],
      env,
    })
    proc.once('close', resolve)
    proc.once('error', reject)
  })
}
