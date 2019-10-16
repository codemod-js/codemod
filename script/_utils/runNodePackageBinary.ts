import * as fs from 'fs';
import { join, dirname } from 'path';
import runExtenalCommand from './runExternalCommand';
import { promisify } from 'util';

const stat = promisify(fs.stat);

export default async function runNodePackageBinary(
  name: string,
  args: ReadonlyArray<string>,
  cwd: string,
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  env?: NodeJS.ProcessEnv
): Promise<number> {
  const path = await findNodeBinary(name, cwd);

  if (!path) {
    throw new Error(`cannot find node package binary: ${name}`);
  }

  return await runExtenalCommand(path, args, cwd, stdin, stdout, stderr, env);
}

async function findNodeBinary(
  name: string,
  directory: string = process.cwd()
): Promise<string | undefined> {
  try {
    const path = join(directory, 'node_modules/.bin', name);
    const stats = await stat(path);

    if (stats.isFile && stats.mode & 0x700) {
      return path;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const parent = dirname(directory);

  if (directory === parent) {
    return undefined;
  }

  return findNodeBinary(name, parent);
}
