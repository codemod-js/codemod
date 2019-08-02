import Transformer from './Transformer';
import { transform, TransformOptions, Printer } from '@codemod/core';
import { PluginItem } from '@babel/core';

export default class InlineTransformer implements Transformer {
  constructor(
    private readonly plugins: Array<PluginItem>,
    private readonly findBabelConfig: boolean = false,
    private readonly printer?: Printer
  ) {}

  async transform(filepath: string, content: string): Promise<string> {
    const options: TransformOptions = {
      filename: filepath,
      babelrc: this.findBabelConfig,
      plugins: this.plugins,
      printer: this.printer
    };

    if (!this.findBabelConfig) {
      options.configFile = this.findBabelConfig;
    }

    const result = transform(content, options);

    if (!result) {
      throw new Error(`[${filepath}] babel transform returned null`);
    }

    return result.code as string;
  }
}
