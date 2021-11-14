import { join } from 'path'

export default function plugin(name: string, ext = '.js'): string {
  return join(__dirname, `../fixtures/plugin/${name}${ext}`)
}
