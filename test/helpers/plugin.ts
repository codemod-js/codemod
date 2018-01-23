import { join } from 'path';

export default function plugin(name: string, ext: string = '.js'): string {
  return join(__dirname, `../fixtures/plugin/${name}${ext}`);
}
