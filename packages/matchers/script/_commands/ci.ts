import rebuild, { MATCHERS_FILE_PATH } from '../_utils/rebuild'
import * as fs from 'fs'
import { join, relative } from 'path'
import runNodePackageBinary from '../../../../script/_utils/runNodePackageBinary'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

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
        (await verifyGeneratedMatchersUpToDate([], stdin, stdout, stderr)) ||
        (await lint([], stdin, stdout, stderr)) ||
        (await test([], stdin, stdout, stderr))
      )

    case 'build':
      return await build(rest, stdin, stdout, stderr)

    case 'verify':
      return await verifyGeneratedMatchersUpToDate(rest, stdin, stdout, stderr)

    case 'test':
      return await test(rest, stdin, stdout, stderr)

    case 'lint':
      return await lint(rest, stdin, stdout, stderr)

    default:
      throw new Error(`unexpected command: ${args[0]}`)
  }
}

async function verifyGeneratedMatchersUpToDate(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  const expected = await rebuild()
  const actual = await readFile(MATCHERS_FILE_PATH, 'utf8')

  if (actual !== expected) {
    const expectedPath = `${MATCHERS_FILE_PATH}.expected`

    await writeFile(expectedPath, expected, 'utf8')

    stderr.write(
      `\x1b[41;1;38;5;232m INVALID \x1b[0m ${relativeToCwd(
        MATCHERS_FILE_PATH
      )} is out of date. Please rebuild it by running ${relativeToCwd(
        require.resolve('../rebuild')
      )}.\n> Expected contents written to ${expectedPath}.`
    )

    return 1
  } else {
    stdout.write(
      `\x1b[42;1;38;5;232m VALID \x1b[0m ${relativeToCwd(
        MATCHERS_FILE_PATH
      )} is up to date!\n`
    )
    return 0
  }
}

function relativeToCwd(path: string, cwd: string = process.cwd()): string {
  return relative(cwd, path)
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
    [
      'packages/matchers',
      '--ext',
      '.ts',
      ...(isCI()
        ? ['--format', 'junit', '-o', 'reports/junit/eslint-results.xml']
        : []),
      ...args,
    ],
    join(__dirname, '../../../..'),
    stdin,
    stdout,
    stderr
  )
}

function isCI(): boolean {
  return process.env.CI === 'true'
}
