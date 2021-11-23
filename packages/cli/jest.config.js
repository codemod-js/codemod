/* eslint-env node */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  testRegex: '/__tests__/(test|.*\\.test)\\.ts$',
  transform: {
    '\\.ts$': 'esbuild-runner/jest',
  },
}
