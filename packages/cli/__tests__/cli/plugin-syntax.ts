import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

it('can load a plugin that uses class properties', async function () {
  expect(
    await runCodemodCLI(
      ['--plugin', plugin('class-properties', '.ts'), '--stdio'],
      { stdin: '' },
    ),
  ).toEqual({
    status: 0,
    stdout: '',
    stderr: '',
  })
})

it('can load a plugin that uses generators', async function () {
  expect(
    await runCodemodCLI(['--plugin', plugin('generators', '.ts'), '--stdio'], {
      stdin: '',
    }),
  ).toEqual({
    status: 0,
    stdout: '',
    stderr: '',
  })
})
