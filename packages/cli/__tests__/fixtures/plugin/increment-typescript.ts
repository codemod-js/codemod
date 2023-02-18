import { defineCodemod } from '../../../src'

enum IncrementValues {
  One = 1,
  Two = 2,
}

export default defineCodemod(() => ({
  visitor: {
    NumericLiteral(path) {
      path.node.value += IncrementValues.One
    },
  },
}))
