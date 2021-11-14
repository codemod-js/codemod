/* eslint-env node */

module.exports = function (api) {
  api.cache(true)
  return {
    plugins: [
      {
        visitor: {
          NumericLiteral(path) {
            path.node.value = 42
          },
        },
      },
    ],
  }
}
