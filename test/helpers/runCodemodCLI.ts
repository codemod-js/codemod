import { execFile } from 'child_process';
import { join } from 'path';

export type CLIResult = { status: number; stdout: string; stderr: string };

export default async function runCodemodCLI(
  args: Array<string>,
  stdin?: string
): Promise<CLIResult> {
  return new Promise(
    (resolve: (result: CLIResult) => void, reject: (error: Error) => void) => {
      let child = execFile(join(__dirname, '../../bin/codemod'), args);
      let stdout = '';
      let stderr = '';

      child.stdin.end(stdin);

      child.on('close', status => {
        resolve({ status, stdout, stderr });
      });

      child.stdout.on('data', chunk => {
        stdout += chunk;
      });

      child.stderr.on('data', chunk => {
        stderr += chunk;
      });

      child.on('error', reject);
    }
  );
}
