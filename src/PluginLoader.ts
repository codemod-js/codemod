import Resolver from './resolvers/Resolver';

export default class PluginLoader {
  constructor(private readonly resolvers: Array<Resolver>) {}

  async load(source: string): Promise<object> {
    for (let resolver of this.resolvers) {
      if (await resolver.canResolve(source)) {
        let resolvedPath = await resolver.resolve(source);
        return require(resolvedPath);
      }
    }

    throw new Error(`unable to resolve a plugin from source: ${source}`);
  }
}
