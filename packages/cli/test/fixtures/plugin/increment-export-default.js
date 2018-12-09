export default function() {
  return {
    visitor: {
      NumericLiteral(path) {
        path.node.value += 1;
      }
    }
  }
};
