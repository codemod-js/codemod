function incrementValue(x: number): number {
  return x + 1;
}

/* tslint:disable */
export default function() {
  return {
    visitor: {
      NumericLiteral(path) {
        let value: number = path.node.value;
        path.node.value = incrementValue(value);
      }
    }
  };
}
