import getStream = require('get-stream');
import { Duplex, PassThrough } from 'stream';
import run from '../../src/index';
import { RealSystem } from '../../src/System';

export interface CLIResult {
  status: number;
  stdout: string;
  stderr: string;
}

export interface TestIO {
  stdin: Duplex;
  stdout: Duplex;
  stderr: Duplex;
}

function makeTestIO(): TestIO {
  return {
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
  const io = makeTestIO();

  io.stdin.end(Buffer.from(stdin));

  const argv = [process.argv[0], require.resolve('../../bin/codemod'), ...args];
  let status: number;
  const oldCwd = process.cwd();

  try {
    if (cwd) {
      process.chdir(cwd);
    }

    status = await run(argv, {
      ...RealSystem,
      stdin: io.stdin as typeof process.stdin,
      stdout: io.stdout as typeof process.stdout,
      stderr: io.stderr as typeof process.stderr
    });
  } finally {
    process.chdir(oldCwd);
  }

  io.stdout.end();
  io.stderr.end();

  const stdout = await getStream(io.stdout);
  const stderr = await getStream(io.stderr);

  return { status, stdout, stderr };
}
