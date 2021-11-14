import { promises as fs } from 'fs'
import { dirname } from 'path'
import createTemporaryFile from '../helpers/createTemporaryFile'
import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'

it('processes files but does not replace their contents when using --dry', async function () {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  expect(
    await runCodemodCLI([afile, '-p', plugin('increment'), '--dry'], {
      cwd: dirname(afile),
    })
  ).toEqual({
    status: 0,
    stdout: `a-file.js\nDRY RUN: no files affected\n1 file(s), 1 modified, 0 errors\n`,
    stderr: '',
  })
  expect(await fs.readFile(afile, 'utf8')).toEqual('3 + 4;')
})
