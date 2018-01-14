import { join } from 'path';

export default function plugin(name: string): string {
  return join(__dirname, `../fixtures/plugin/${name}.js`);
}
