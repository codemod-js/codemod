import makeDebug = require('debug');
import { Update, UpdateType } from './ChildProcessTransformer';
import Environment, { EnvironmentStruct } from './Environment';
import InlineTransformer from './InlineTransformer';

const debug = makeDebug(`codemod:transformer:child:pid=${process.pid}`);

export enum MessageType {
  Configure = 'Configure',
  Transform = 'Transform',
  Exit = 'Exit'
}

export type Message =
  | { type: MessageType.Configure; environment: EnvironmentStruct }
  | { type: MessageType.Transform; filepath: string; content: string }
  | { type: MessageType.Exit };

async function run() {
  debug('initializing');

  let transformer: InlineTransformer | undefined;

  async function handleMessage(message: Message) {
    debug('received message: %o', message);

    switch (message.type) {
      case MessageType.Configure:
        await configure(message.environment);
        break;

      case MessageType.Transform:
        await transform(message.filepath, message.content);
        break;

      case MessageType.Exit:
        exit();
        break;
    }
  }

  function sendUpdate(update: Update): void {
    debug('sending update to parent: %o', update);
    if (process.send) {
      process.send(update);
    }
  }

  async function configure(data: EnvironmentStruct): Promise<void> {
    let environment = Environment.fromObject(data);
    debug('configuring based on environment: %o', environment);

    let plugins = await environment.loadPlugins();
    debug('loading plugins for environment: %o', plugins);

    transformer = new InlineTransformer(plugins);
    debug('created transformer: %o', transformer);

    sendUpdate({ type: UpdateType.Ready });
  }

  function exit(): void {
    debug('exiting on next tick');
    sendUpdate({ type: UpdateType.Exiting });
    setImmediate(() => process.disconnect());
  }

  async function transform(filepath: string, content: string): Promise<void> {
    if (!transformer) {
      debug(
        'refusing to transform "%s" because no transformer exists',
        filepath
      );
      throw new Error(
        `cannot transform if transformer is not initialized – maybe you need to configure first?`
      );
    }

    try {
      debug('transforming "%s" with content: %s', filepath, content);
      let output = await transformer.transform(filepath, content);
      sendUpdate({ type: UpdateType.Transformed, filepath, output });
    } catch (error) {
      sendError(error);
    } finally {
      sendUpdate({ type: UpdateType.Ready });
    }
  }

  function sendError(error: Error): void {
    debug('sending error to parent: %s', error.message);
    sendUpdate({
      type: UpdateType.Error,
      error: error.constructor.name,
      stack: error.stack,
      message: error.message
    });
  }

  process.on('message', async message => {
    try {
      await handleMessage(message);
    } catch (error) {
      sendError(error);
    }
  });
}

if (require.main) {
  run();
}
