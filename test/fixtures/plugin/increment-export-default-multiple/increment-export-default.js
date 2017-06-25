import incrementValue from './increment-value'

export default function() {
  return {
    visitor: {
      NumericLiteral(path) {
        path.node.value = incrementValue(path.node.value);
      }
    }
  }
};
