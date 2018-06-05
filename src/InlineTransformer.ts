import { transform } from '@babel/core';
import { BabelPlugin } from './BabelPluginTypes';
import Transformer from './Transformer';

export default class InlineTransformer implements Transformer {
  constructor(private readonly plugins: Array<BabelPlugin>) {}

  async transform(filepath: string, content: string): Promise<string> {
    return transform(content, {
      filename: filepath,
      babelrc: false,
      plugins: this.plugins
    } as {}).code as string;
  }
}
