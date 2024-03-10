import { existsSync } from 'fs'
import { dirname, join } from 'path'

export function getRepoRoot(): string {
  let current = __dirname

  for (;;) {
    const next = dirname(current)

    if (current === next) {
      throw new Error('Could not find .git directory')
    }

    if (existsSync(join(next, '.git'))) {
      return next
    }

    current = next
  }
}
