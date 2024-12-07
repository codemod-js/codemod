import { oneOrMore, slice, spacer, zeroOrMore } from '../matchers/slice'
import { distributeAcrossSlices } from '../utils/distributeAcrossSlices'

it('allocates nothing given an empty list of slices', () => {
  expect(Array.from(distributeAcrossSlices([], 1))).toEqual([[]])
})

it('allocates available to a single slice within its bounds', () => {
  expect(
    Array.from(distributeAcrossSlices([slice({ min: 0, max: 3 })], 2)),
  ).toEqual([[2]])
  expect(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 3)),
  ).toEqual([[3]])
})

it('allocates nothing if available is outside single slice bounds', () => {
  expect(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 1)),
  ).toEqual([])
  expect(
    Array.from(distributeAcrossSlices([slice({ min: 2, max: 4 })], 5)),
  ).toEqual([])
})

it('allocates a single space across multiple slices', () => {
  expect(
    Array.from(
      distributeAcrossSlices(
        [slice({ min: 0, max: 1 }), slice({ min: 0, max: 1 })],
        1,
      ),
    ),
  ).toEqual([
    [1, 0],
    [0, 1],
  ])
})

it('allocates multiple spaces across multiple slices', () => {
  expect(
    Array.from(
      distributeAcrossSlices(
        [
          slice({ min: 1, max: 2 }),
          slice({ min: 0, max: 1 }),
          slice({ min: 2, max: 3 }),
        ],
        5,
      ),
    ),
  ).toEqual([
    [2, 1, 2],
    [2, 0, 3],
    [1, 1, 3],
  ])
})

it('never allocates to empty slices', () => {
  expect(
    Array.from(
      distributeAcrossSlices(
        [slice(0), slice({ min: 0, max: 1 }), slice({ min: 0, max: 1 })],
        1,
      ),
    ),
  ).toEqual([
    [0, 1, 0],
    [0, 0, 1],
  ])
})

it('allocates correctly when slices have no upper bound', () => {
  expect(Array.from(distributeAcrossSlices([zeroOrMore()], 2))).toEqual([[2]])
})

it('allocates correctly with a trailing unbounded slice', () => {
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 1),
    ),
  ).toEqual([])
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 2),
    ),
  ).toEqual([[0, 1, 1]])
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 3),
    ),
  ).toEqual([
    [1, 1, 1],
    [0, 1, 2],
  ])
})

it('deprecated spacer() is an alias for slice(1)', () => {
  expect(spacer()).toEqual(slice(1))
})
