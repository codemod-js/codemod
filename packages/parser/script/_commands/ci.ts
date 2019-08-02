import { join } from 'path';
import runNodePackageBinary from '../../../../script/_utils/runNodePackageBinary';

export default async function main(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  const rest = args.slice(1);

  switch (args[0]) {
    case undefined:
      return (
        (await lint(rest, stdin, stdout, stderr)) ||
        (await runTests(args, stdin, stdout, stderr))
      );

    case 'test':
      return await runTests(args, stdin, stdout, stderr);

    case 'lint':
      return await lint(rest, stdin, stdout, stderr);

    default:
      throw new Error(`unexpected command: ${args[0]}`);
  }
}

async function runTests(
  args: Array<string>,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream
): Promise<number> {
  return await runNodePackageBinary(
    'jest',
    ['--ci'],
    join(__dirname, '../..'),
    stdin,
    stdout,
    stderr
  );
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
      'packages/parser',
      '--ext',
      '.ts',
      ...(isCI()
        ? ['--format', 'junit', '-o', 'reports/junit/eslint-results.xml']
        : []),
      ...args
    ],
    join(__dirname, '../../../..'),
    stdin,
    stdout,
    stderr
  );
}

function isCI(): boolean {
  return process.env.CI === 'true';
}
