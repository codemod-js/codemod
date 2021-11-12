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
      return await build(rest, stdin, stdout, stderr)

    case 'test':
      return (
        (await build([], stdin, stdout, stderr)) ||
        (await test(rest, stdin, stdout, stderr))
      )

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
    'mocha',
    ['test/**/*Test.js', '--color', ...args],
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
    ['packages/cli', '--ext', '.ts', ...args],
    join(__dirname, '../../../..'),
    stdin,
    stdout,
    stderr
  )
}
