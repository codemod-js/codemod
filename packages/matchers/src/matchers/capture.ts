import { anything } from '../matchers';
import Matcher from './Matcher';

export class CapturedMatcher<T> extends Matcher<T> {
  private _current?: T;
  private _currentKeys?: ReadonlyArray<PropertyKey>;

  constructor(private readonly matcher: Matcher<T> = anything()) {
    super();
  }

  get current(): T | undefined {
    return this._current;
  }

  get currentKeys(): ReadonlyArray<PropertyKey> | undefined {
    return this._currentKeys;
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is T {
    if (this.matcher.matchValue(value, keys)) {
      this.capture(value, keys);
      return true;
    } else {
      return false;
    }
  }

  protected capture(value: T, keys: ReadonlyArray<PropertyKey>): void {
    this._current = value;
    this._currentKeys = keys;
  }
}

export default function capture<T>(matcher?: Matcher<T>): CapturedMatcher<T> {
  return new CapturedMatcher(matcher);
}
