export class Spacer {
  constructor(readonly min: number, readonly max: number) {}
}

export function zeroOrMore(): Spacer {
  return new Spacer(0, Infinity);
}

export function oneOrMore(): Spacer {
  return new Spacer(1, Infinity);
}

export function spacer(min: number = 1, max: number = min): Spacer {
  return new Spacer(min, max);
}
