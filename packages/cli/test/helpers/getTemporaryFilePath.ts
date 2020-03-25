import { join } from 'path'

export default function getTemporaryFilePath(path: string): string {
  return join(__dirname, '../../tmp', path)
}
