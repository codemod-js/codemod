import Transformer from './Transformer'
import { transform, TransformOptions } from '@codemod/core'
import { PluginItem } from '@babel/core'

export default class InlineTransformer implements Transformer {
  constructor(private readonly plugins: Array<PluginItem>) {}

  async transform(filepath: string, content: string): Promise<string> {
    const options: TransformOptions = {
      filename: filepath,
      babelrc: false,
      configFile: false,
      plugins: this.plugins,
    }

    const result = transform(content, options)

    if (!result) {
      throw new Error(`[${filepath}] babel transform returned null`)
    }

    return result.code as string
  }
}
