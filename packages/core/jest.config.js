/* eslint-env node */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'node',
  testRegex: '/__tests__/(test|.*\\.test)\\.ts$',
  transform: {
    '\\.ts$': 'esbuild-runner/jest',
  },
}
