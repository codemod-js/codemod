import {incrementValue} from './increment-export-default';

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
