import { promises as fs } from 'fs'
import { dirname } from 'path'
import createTemporaryFile from '../helpers/createTemporaryFile'
import plugin from '../helpers/plugin'
import { runCodemodCLI } from '../helpers/runCodemodCLI'
import { startServer } from '../helpers/TestServer'

test('can load and run with a remote plugin', async () => {
  const afile = await createTemporaryFile('a-file.js', '3 + 4;')
  const server = await startServer(async (req, res) => {
    expect(req.url).toEqual('/plugin.js')

    res.end(
      await fs.readFile(plugin('increment-export-default'), {
        encoding: 'utf8',
      })
    )
  })

  try {
    const { status, stdout, stderr } = await runCodemodCLI(
      [afile, '--remote-plugin', server.requestURL('/plugin.js').toString()],
      { cwd: dirname(afile) }
    )

    expect({ status, stdout, stderr }).toEqual({
      status: 0,
      stdout: `a-file.js\n1 file(s), 1 modified, 0 errors\n`,
      stderr: '',
    })

    expect(await fs.readFile(afile, 'utf8')).toEqual('4 + 5;')
  } finally {
    await server.stop()
  }
})
