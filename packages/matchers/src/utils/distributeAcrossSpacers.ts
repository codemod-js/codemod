import { Spacer } from '../matchers/spacers'

export default function* distributeAcrossSpacers(
  spacers: Array<Spacer>,
  available: number
): IterableIterator<Array<number>> {
  if (spacers.length === 0) {
    yield []
  } else if (spacers.length === 1) {
    const spacer = spacers[0]

    if (spacer.min <= available && available <= spacer.max) {
      yield [available]
    }
  } else {
    const last = spacers[spacers.length - 1]

    for (
      let allocateToLast = last.min;
      allocateToLast <= last.max && allocateToLast <= available;
      allocateToLast++
    ) {
      const allButLast = spacers.slice(0, -1)

      for (const allButLastAllocations of distributeAcrossSpacers(
        allButLast,
        available - allocateToLast
      )) {
        yield [...allButLastAllocations, allocateToLast]
      }
    }
  }
}
