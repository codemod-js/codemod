import { spawn } from 'child_process';

export default async function runInPackages(
  stdin: NodeJS.ReadStream,
  stdout: NodeJS.WriteStream,
  stderr: NodeJS.WriteStream,
  command: string,
  args: Array<string> = []
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      'yarn',
      ['lerna', 'exec', '--stream', 'script/ci', ...args],
      {
        stdio: [stdin, stdout, stderr]
      }
    );

    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `exit status was ${code} for command: ${command} ${args.join(' ')}`
          )
        );
      }
    });
  });
}
