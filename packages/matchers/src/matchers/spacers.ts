export class Spacer {
  constructor(readonly min: number, readonly max: number) {}
}

export function zeroOrMore(): Spacer {
  return new Spacer(0, Infinity)
}

export function oneOrMore(): Spacer {
  return new Spacer(1, Infinity)
}

export function spacer(min = 1, max = min): Spacer {
  return new Spacer(min, max)
}
