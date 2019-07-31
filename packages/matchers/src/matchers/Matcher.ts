export default class Matcher<T> {
  match(value: unknown, keys: ReadonlyArray<PropertyKey> = []): value is T {
    return this.matchValue(value, keys);
  }

  matchValue(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    value: unknown,
    keys: ReadonlyArray<PropertyKey>
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ): value is T {
    throw new Error(`${this.constructor.name}#matchValue is not implemented`);
  }
}
