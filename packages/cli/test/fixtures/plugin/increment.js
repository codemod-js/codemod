module.exports = function () {
  return {
    visitor: {
      NumericLiteral(path) {
        path.node.value += 1
      },
    },
  }
}
