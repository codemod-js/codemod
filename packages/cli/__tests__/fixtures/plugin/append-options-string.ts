import { defineCodemod } from '../../../src'

export default defineCodemod(({ t }, options) => ({
  visitor: {
    Program(path) {
      path.node.body.push(
        t.expressionStatement(t.stringLiteral(JSON.stringify(options)))
      )
    },
  },
}))
