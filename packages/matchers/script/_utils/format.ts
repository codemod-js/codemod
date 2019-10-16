import { format as prettier, resolveConfig } from 'prettier';

export default async function format(
  code: string,
  path: string
): Promise<string> {
  const config = await resolveConfig(path);

  return prettier(code, { ...config, filepath: path });
}
