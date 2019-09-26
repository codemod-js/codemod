import getStream = require('get-stream');
import { PassThrough } from 'stream';
import run from '../../src/index';
import { RealSystem, System } from '../../src/System';

export interface CLIResult {
  status: number;
  stdout: string;
  stderr: string;
}

function makeTestSystem(): System {
  return {
    ...RealSystem,
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    stderr: new PassThrough()
  };
}

export default async function runCodemodCLI(
  args: Array<string>,
  stdin = '',
  cwd?: string
): Promise<CLIResult> {
  const sys = makeTestSystem();

  sys.stdin.end(Buffer.from(stdin));

  const argv = [process.argv[0], require.resolve('../../bin/codemod'), ...args];
  let status: number;
  const oldCwd = process.cwd();

  try {
    if (cwd) {
      process.chdir(cwd);
    }

    status = await run(argv, sys);
  } finally {
    process.chdir(oldCwd);
  }

  sys.stdout.end();
  sys.stderr.end();

  const stdout = await getStream(sys.stdout);
  const stderr = await getStream(sys.stderr);

  return { status, stdout, stderr };
}
