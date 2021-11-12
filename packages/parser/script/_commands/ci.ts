import { join } from 'path'
import runNodePackageBinary from '../../../../script/_utils/runNodePackageBinary'

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  const rest = args.slice(1)

  switch (args[0]) {
    case undefined:
      return (
        (await build([], stdin, stdout, stderr)) ||
        (await lint([], stdin, stdout, stderr)) ||
        (await test([], stdin, stdout, stderr))
      )

    case 'build':
      return await test(rest, stdin, stdout, stderr)

    case 'test':
      return await test(rest, stdin, stdout, stderr)

    case 'lint':
      return await lint(rest, stdin, stdout, stderr)

    default:
      throw new Error(`unexpected command: ${args[0]}`)
  }
}

async function build(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  return await runNodePackageBinary(
    'tsc',
    args,
    join(__dirname, '../..'),
    stdin,
    stdout,
    stderr
  )
}

async function test(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  return await runNodePackageBinary(
    'jest',
    ['--ci', '--color', '--verbose', ...args],
    join(__dirname, '../..'),
    stdin,
    stdout,
    stderr
  )
}

async function lint(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  return await runNodePackageBinary(
    'eslint',
    ['packages/parser', '--ext', '.ts', ...args],
    join(__dirname, '../../../..'),
    stdin,
    stdout,
    stderr
  )
}
