/* eslint-env node */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  testRegex: '/__tests__/(test|.*\\.test)\\.ts$',
  transform: {
    '\\.ts$': 'esbuild-runner/jest',
  },
}
