/* eslint-env node */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'node',
  testRegex: '/__tests__/(test|.*\\.test)\\.ts$',
  transform: {
    '\\.ts$': 'esbuild-runner/jest',
  },
  collectCoverageFrom: ['!src/matchers.ts'],
}
