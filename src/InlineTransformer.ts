import { transformAsync } from '@babel/core';
import { BabelPlugin } from './BabelPluginTypes';
import Config from './Config';
import Transformer from './Transformer';

export default class InlineTransformer implements Transformer {
  constructor(private readonly plugins: Array<BabelPlugin>) {}

  async transform(filepath: string, content: string): Promise<string> {
    let result = await transformAsync(content, {
      filename: filepath,
      babelrc: false,
      plugins: this.plugins
    });

    if (!result) {
      throw new Error(`[${filepath}] babel transform returned null`);
    }

    return result.code as string;
  }
}
