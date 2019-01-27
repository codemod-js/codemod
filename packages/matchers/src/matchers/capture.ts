import { anything } from '../matchers';
import Matcher from './Matcher';

export class CapturedMatcher<T> extends Matcher<T> {
  private _current: T | undefined;

  constructor(private readonly matcher: Matcher<T> = anything()) {
    super();
  }

  get current(): T | undefined {
    return this._current;
  }

  match(value: unknown): value is T {
    if (this.matcher.match(value)) {
      this.capture(value);
      return true;
    } else {
      return false;
    }
  }

  protected capture(value: T): void {
    this._current = value;
  }
}

export default function capture<T>(matcher?: Matcher<T>): CapturedMatcher<T> {
  return new CapturedMatcher(matcher);
}
