import { spawn } from 'child_process';

export default async function runInDirectory(
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  directory: string,
  command: string,
  args: Array<string> = []
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stdout.write(`${directory} ❯ ${command} ${args.join(' ')}\n`);

    const child = spawn(
      command,
      args,
      {
        cwd: directory,
        stdio: [stdin, stdout, stderr]
      });

    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`exit status was ${code} for command: ${command} args: [${args.join(' ')}]`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}
