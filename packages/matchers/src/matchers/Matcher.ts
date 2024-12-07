export class Matcher<T> {
  match(value: unknown, keys: ReadonlyArray<PropertyKey> = []): value is T {
    return this.matchValue(value, keys)
  }

  matchValue(
    value: unknown,
    keys: ReadonlyArray<PropertyKey>,

  ): value is T {
    void keys
    throw new Error(`${this.constructor.name}#matchValue is not implemented`)
  }
}
