import { anything } from '../matchers'
import Matcher from './Matcher'

export interface CaptureBase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export class CapturedMatcher<C, M = C> extends Matcher<M> {
  private _current?: C
  private _currentKeys?: ReadonlyArray<PropertyKey>

  constructor(private readonly matcher: Matcher<C> = anything()) {
    super()
  }

  get current(): C | undefined {
    return this._current
  }

  get currentKeys(): ReadonlyArray<PropertyKey> | undefined {
    return this._currentKeys
  }

  matchValue(value: unknown, keys: ReadonlyArray<PropertyKey>): value is M {
    if (this.matcher.matchValue(value, keys)) {
      this.capture((value as unknown) as C, keys)
      return true
    } else {
      return false
    }
  }

  protected capture(value: C, keys: ReadonlyArray<PropertyKey>): void {
    this._current = value
    this._currentKeys = keys
  }
}

export default function capture<C, M = C>(
  matcher?: Matcher<C>
): CapturedMatcher<C, M> {
  return new CapturedMatcher(matcher)
}
