import { transform } from '@babel/core';
import { BabelPlugin } from './BabelPlugins';
import Transformer from './Transformer';

export default class InlineTransformer implements Transformer {
  constructor(private readonly plugins: Array<BabelPlugin>) {}

  async ready(): Promise<void> {
    // calls to `transform` don't ever need to wait
  }

  async transform(filepath: string, content: string): Promise<string> {
    return transform(content, {
      filename: filepath,
      babelrc: false,
      plugins: this.plugins
    } as {}).code as string;
  }

  async cleanup(): Promise<void> {
    // nothing to do
  }
}
