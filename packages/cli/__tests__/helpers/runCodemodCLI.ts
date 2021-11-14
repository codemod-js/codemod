import { spawn } from 'child_process'
import { join } from 'path'

export interface CLIResult {
  status: number
  stdout: string
  stderr: string
}

export async function runCodemodCLI(
  args: Array<string>,
  { stdin = '', cwd }: { stdin?: string; cwd?: string } = {}
): Promise<CLIResult> {
  const child = spawn(
    'node',
    [
      '-r',
      require.resolve('esbuild-runner'),
      join(__dirname, '../../bin/codemod'),
      ...args,
    ],
    {
      stdio: 'pipe',
      cwd,
    }
  )

  child.stdin.end(stdin)

  let stdout = ''
  child.stdout.setEncoding('utf-8').on('readable', () => {
    stdout += child.stdout.read() ?? ''
  })

  let stderr = ''
  child.stderr.setEncoding('utf-8').on('readable', () => {
    stderr += child.stderr.read() ?? ''
  })

  return new Promise((resolve, reject) => {
    child
      .on('exit', (status) => {
        resolve({ status: status ?? 1, stdout, stderr })
      })
      .on('error', reject)
  })
}
