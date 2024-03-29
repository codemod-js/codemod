import getPort = require('get-port')
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { URL } from 'url'

export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void

export class RealTestServer {
  private server: Server

  readonly protocol: string = 'http:'
  readonly hostname: string = '127.0.0.1'

  constructor(readonly port: number, readonly handler: RequestHandler) {
    this.server = createServer(handler)
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.once('listening', () => resolve())
      this.server.listen(this.port)
    })
  }

  async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.close(() => resolve())
    })
  }

  requestURL(path: string): URL {
    return new URL(`${this.protocol}//${this.hostname}:${this.port}${path}`)
  }
}

export async function startServer(
  handler: RequestHandler
): Promise<RealTestServer> {
  const port = await getPort()
  const server = new RealTestServer(port, handler)
  await server.start()
  return server
}
