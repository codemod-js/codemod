import { runCodemodCLI } from '../helpers/runCodemodCLI'

test('prints help', async function () {
  expect(await runCodemodCLI(['--help'])).toEqual({
    status: 0,
    stdout: expect.stringContaining('codemod [OPTIONS]'),
    stderr: '',
  })
})

test('prints the version', async function () {
  expect(await runCodemodCLI(['--version'])).toEqual({
    status: 0,
    stdout: expect.stringMatching(/\d+\.\d+\.\d+\s*$/),
    stderr: '',
  })
})
