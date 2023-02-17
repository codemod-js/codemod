import { PluginItem } from '@babel/core'
import { ParserPlugin } from '@babel/parser'
import { transform, TransformOptions } from '@codemod/core'
import Transformer from './Transformer'

export class InlineTransformer implements Transformer {
  constructor(
    private readonly plugins: Iterable<PluginItem>,
    private readonly parserPlugins: Iterable<ParserPlugin> = []
  ) {}

  async transform(filepath: string, content: string): Promise<string> {
    const options: TransformOptions = {
      filename: filepath,
      babelrc: false,
      configFile: false,
      plugins: [...this.plugins],
      parserOpts: {
        plugins: [...this.parserPlugins],
      },
    }

    const result = transform(content, options)

    if (!result) {
      throw new Error(`[${filepath}] babel transform returned null`)
    }

    return result.code as string
  }
}
