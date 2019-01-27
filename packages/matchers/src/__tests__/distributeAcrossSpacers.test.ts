import distributeAcrossSpacers from '../utils/distributeAcrossSpacers';
import { spacer, oneOrMore, zeroOrMore } from '../matchers/spacers';

test('allocates nothing given an empty list of spacers', () => {
  expect(Array.from(distributeAcrossSpacers([], 1))).toEqual([[]]);
});

test('allocates available to a single spacer within its bounds', () => {
  expect(Array.from(distributeAcrossSpacers([spacer(0, 3)], 2))).toEqual([[2]]);
  expect(Array.from(distributeAcrossSpacers([spacer(2, 4)], 3))).toEqual([[3]]);
});

test('allocates nothing if available is outside single spacer bounds', () => {
  expect(Array.from(distributeAcrossSpacers([spacer(2, 4)], 1))).toEqual([]);
  expect(Array.from(distributeAcrossSpacers([spacer(2, 4)], 5))).toEqual([]);
});

test('allocates a single space across multiple spacers', () => {
  expect(
    Array.from(distributeAcrossSpacers([spacer(0, 1), spacer(0, 1)], 1))
  ).toEqual([[1, 0], [0, 1]]);
});

test('allocates multiple spaces across multiple spacers', () => {
  expect(
    Array.from(
      distributeAcrossSpacers([spacer(1, 2), spacer(0, 1), spacer(2, 3)], 5)
    )
  ).toEqual([[2, 1, 2], [2, 0, 3], [1, 1, 3]]);
});

test('never allocates to empty spacers', () => {
  expect(
    Array.from(
      distributeAcrossSpacers([spacer(0), spacer(0, 1), spacer(0, 1)], 1)
    )
  ).toEqual([[0, 1, 0], [0, 0, 1]]);
});

test('allocates correctly when spacers have no upper bound', () => {
  expect(Array.from(distributeAcrossSpacers([zeroOrMore()], 2))).toEqual([[2]]);
});

test('allocates correctly with a trailing unbounded spacer', () => {
  expect(
    Array.from(
      distributeAcrossSpacers([zeroOrMore(), spacer(), oneOrMore()], 1)
    )
  ).toEqual([]);
  expect(
    Array.from(
      distributeAcrossSpacers([zeroOrMore(), spacer(), oneOrMore()], 2)
    )
  ).toEqual([[0, 1, 1]]);
  expect(
    Array.from(
      distributeAcrossSpacers([zeroOrMore(), spacer(), oneOrMore()], 3)
    )
  ).toEqual([[1, 1, 1], [0, 1, 2]]);
});
