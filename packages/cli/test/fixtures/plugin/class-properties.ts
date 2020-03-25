import { PluginObj } from '@babel/core'

class Count {
  // This file exists to verify that class properties like ↓ can be loaded.
  count = 0

  incr(): void {
    this.count++
  }
}

export default function (): PluginObj {
  const debuggerCount = new Count()

  return {
    visitor: {
      DebuggerStatement(): void {
        debuggerCount.incr()
      },
    },
  }
}
