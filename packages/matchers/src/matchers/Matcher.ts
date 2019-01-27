export default class Matcher<T> {
  // eslint-disable-next-line typescript/no-unused-vars
  match(value: unknown): value is T {
    throw new Error(`${this.constructor.name}#match is not implemented`);
  }
}
