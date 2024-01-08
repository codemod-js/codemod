import type Babel from '@babel/core'
import type { PluginObj, PluginPass } from '@babel/core'
import type Resolver from './resolvers/Resolver'

export class PluginLoader {
  constructor(private readonly resolvers: Array<Resolver>) {}

  async load(
    source: string,
  ): Promise<(babel: typeof Babel) => PluginObj<PluginPass>> {
    for await (const resolver of this.resolvers) {
      if (await resolver.canResolve(source)) {
        const resolvedPath = await resolver.resolve(source)
        const plugin = await import(resolvedPath)
        return plugin?.default || plugin
      }
    }

    throw new Error(`unable to resolve a plugin from source: ${source}`)
  }
}
