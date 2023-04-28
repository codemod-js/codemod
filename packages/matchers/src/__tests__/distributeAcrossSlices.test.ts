import { oneOrMore, slice, spacer, zeroOrMore } from '../matchers/slice'
import { distributeAcrossSlices } from '../utils/distributeAcrossSlices'

test('allocates nothing given an empty list of slices', () => {
  expect(Array.from(distributeAcrossSlices([], 1))).toEqual([[]])
})

test('allocates available to a single slice within its bounds', () => {
  expect(Array.from(distributeAcrossSlices([slice(0, 3)], 2))).toEqual([[2]])
  expect(Array.from(distributeAcrossSlices([slice(2, 4)], 3))).toEqual([[3]])
})

test('allocates nothing if available is outside single slice bounds', () => {
  expect(Array.from(distributeAcrossSlices([slice(2, 4)], 1))).toEqual([])
  expect(Array.from(distributeAcrossSlices([slice(2, 4)], 5))).toEqual([])
})

test('allocates a single space across multiple slices', () => {
  expect(
    Array.from(distributeAcrossSlices([slice(0, 1), slice(0, 1)], 1))
  ).toEqual([
    [1, 0],
    [0, 1],
  ])
})

test('allocates multiple spaces across multiple slices', () => {
  expect(
    Array.from(
      distributeAcrossSlices([slice(1, 2), slice(0, 1), slice(2, 3)], 5)
    )
  ).toEqual([
    [2, 1, 2],
    [2, 0, 3],
    [1, 1, 3],
  ])
})

test('never allocates to empty slices', () => {
  expect(
    Array.from(
      distributeAcrossSlices([slice(0), slice(0, 1), slice(0, 1)], 1)
    )
  ).toEqual([
    [0, 1, 0],
    [0, 0, 1],
  ])
})

test('allocates correctly when slices have no upper bound', () => {
  expect(Array.from(distributeAcrossSlices([zeroOrMore()], 2))).toEqual([[2]])
})

test('allocates correctly with a trailing unbounded slice', () => {
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 1)
    )
  ).toEqual([])
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 2)
    )
  ).toEqual([[0, 1, 1]])
  expect(
    Array.from(
      distributeAcrossSlices([zeroOrMore(), slice(1), oneOrMore()], 3)
    )
  ).toEqual([
    [1, 1, 1],
    [0, 1, 2],
  ])
})

test('deprecated spacer() is an alias for slice(1)', () => {
  expect(spacer()).toEqual(slice(1))
})
