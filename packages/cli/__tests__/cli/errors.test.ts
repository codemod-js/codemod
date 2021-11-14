import createTemporaryFile from '../helpers/createTemporaryFile'
import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

test('fails with an error when passing an invalid option', async function () {
  expect(await runCodemodCLI(['--not-a-real-option'])).toEqual({
    status: 1,
    stdout: '',
    stderr: expect.stringContaining(
      'ERROR: unexpected option: --not-a-real-option'
    ),
  })
})

test('fails with an error when a plugin throws an exception', async function () {
  expect(
    await runCodemodCLI(['--plugin', plugin('bad-plugin'), '--stdio'], {
      stdin: '3+4',
    })
  ).toEqual({
    status: 1,
    stdout: '',
    stderr: expect.stringContaining('I am a bad plugin'),
  })
})

it('does not try to load TypeScript files when --no-transpile-plugins is set', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([
      afile,
      '--no-transpile-plugins',
      '-p',
      plugin('increment-typescript', ''),
    ])
  ).toEqual({
    status: 255,
    stdout: '',
    stderr: expect.stringContaining('SyntaxError'),
  })
})
