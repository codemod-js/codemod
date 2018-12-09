import { transformAsync, TransformOptions } from '@babel/core';
import { BabelPlugin } from './BabelPluginTypes';
import Transformer from './Transformer';

export default class InlineTransformer implements Transformer {
  constructor(
    private readonly plugins: Array<BabelPlugin>,
    private readonly findBabelConfig: boolean = false
  ) {}

  async transform(filepath: string, content: string): Promise<string> {
    let options: TransformOptions = {
      filename: filepath,
      babelrc: this.findBabelConfig,
      plugins: this.plugins
    };

    if (!this.findBabelConfig) {
      options.configFile = this.findBabelConfig;
    }

    let result = await transformAsync(content, options);

    if (!result) {
      throw new Error(`[${filepath}] babel transform returned null`);
    }

    return result.code as string;
  }
}
