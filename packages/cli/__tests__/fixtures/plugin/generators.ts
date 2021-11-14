import { PluginObj } from '@babel/core'

// This file exists to verify that generator functions like ↓ can be loaded.
function* counter(): IterableIterator<number> {
  let i = 0

  while (true) {
    yield i++
  }
}

export default function (): PluginObj {
  const identifiers = counter()

  return {
    visitor: {
      Identifier(): void {
        console.log(identifiers.next())
      },
    },
  }
}
