import type { SliceMatcher } from '../matchers/slice'

/**
 * Iterates through the possible allocations of `available` across `slices`.
 */
export function* distributeAcrossSlices(
  slices: Array<SliceMatcher<unknown>>,
  available: number,
): IterableIterator<Array<number>> {
  if (slices.length === 0) {
    yield []
  }
  else if (slices.length === 1) {
    const spacer = slices[0]

    if (spacer.min <= available && available <= spacer.max) {
      yield [available]
    }
  }
  else {
    const last = slices[slices.length - 1]

    for (
      let allocateToLast = last.min;
      allocateToLast <= last.max && allocateToLast <= available;
      allocateToLast++
    ) {
      const allButLast = slices.slice(0, -1)

      for (const allButLastAllocations of distributeAcrossSlices(
        allButLast,
        available - allocateToLast,
      )) {
        yield [...allButLastAllocations, allocateToLast]
      }
    }
  }
}
