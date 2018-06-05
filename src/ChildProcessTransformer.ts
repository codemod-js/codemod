import { fork, ChildProcess } from 'child_process';
import makeDebug = require('debug');
import { Message, MessageType } from './ChildProcessTransformerMain';
import Environment from './Environment';
import Transformer from './Transformer';

const debug = makeDebug('codemod:transformer:parent');

export enum UpdateType {
  Ready = 'Ready',
  Transformed = 'Transformed',
  Error = 'Error',
  Exiting = 'Exiting',
  Exited = 'Exited'
}

export type Update =
  | { type: UpdateType.Ready }
  | { type: UpdateType.Transformed; filepath: string; output: string }
  | { type: UpdateType.Error; error: string; stack?: string; message: string }
  | { type: UpdateType.Exiting };

export default class ChildProcessTransformer implements Transformer {
  private childProcess?: ChildProcess;
  private currentFilepath?: string;
  private currentStatus?: UpdateType;
  private readonly callbacks = new Array<() => void>();
  private transformResolve?: (result: string) => void;
  private transformReject?: (error: Error) => void;
  private cleanupResolve?: () => void;
  private cleanupReject?: (error: Error) => void;

  constructor(private readonly environment: Environment) {}

  async ready(): Promise<void> {
    return new Promise<void>(resolve => {
      this.start();

      if (this.currentStatus === UpdateType.Ready) {
        resolve();
      } else {
        this.callbacks.push(resolve);
      }
    });
  }

  async transform(filepath: string, content: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.currentFilepath) {
        throw new Error(
          `already running a transform for ${
            this.currentFilepath
          }, use 'await transformer.ready()' to wait`
        );
      }

      this.currentFilepath = filepath;
      this.transformResolve = resolve;
      this.transformReject = reject;

      this.send({ type: MessageType.Transform, filepath, content });
    });
  }

  async cleanup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.childProcess) {
        this.cleanupResolve = resolve;
        this.cleanupReject = reject;
        this.send({ type: MessageType.Exit });
      } else {
        resolve();
      }
    });
  }

  private start(): void {
    if (this.childProcess) {
      return;
    }

    let childProcess = fork(require.resolve('./ChildProcessTransformerMain'));

    childProcess.on('message', message => {
      this.handleMessage(message);
    });

    childProcess.on('error', error => {
      debug('received error: %o', error);
      const { transformReject } = this;

      if (transformReject) {
        this.resetAfter(() => transformReject(error));
      }
    });

    childProcess.on('exit', code => {
      debug(
        'child transformer exited with code=%d, resetting childProcess',
        code
      );
      this.childProcess = undefined;
      this.currentStatus = UpdateType.Exited;

      const { cleanupResolve, cleanupReject } = this;

      if (code === 0) {
        this.resetAfter(() => {
          if (cleanupResolve) {
            cleanupResolve();
          }
        });
      } else {
        this.resetAfter(() => {
          if (cleanupReject) {
            cleanupReject(
              new Error(`child transformer exited with code=${code}`)
            );
          }
        });
      }
    });

    this.childProcess = childProcess;

    this.send({
      type: MessageType.Configure,
      environment: this.environment.toObject()
    });
  }

  private resetAfter(callback: () => void): void {
    try {
      callback();
    } finally {
      this.reset();
    }
  }

  private reset(): void {
    this.transformResolve = undefined;
    this.transformReject = undefined;
    this.currentFilepath = undefined;
  }

  private send(message: Message): void {
    if (!this.childProcess) {
      debug('refusing to send message without a child: %o', message);

      throw new Error(
        `cannot send message ${
          message.type
        } without a child process – maybe #start wasn't called?`
      );
    }

    debug('sending message: %o', message);
    this.childProcess.send(message);
  }

  private handleMessage(update: Update): void {
    debug('received update: %o', update);
    this.currentStatus = update.type;

    switch (update.type) {
      case UpdateType.Ready:
        debug(
          'resolving %d "%s" callback(s)',
          this.callbacks.length,
          UpdateType.Ready
        );
        for (let callback of this.callbacks) {
          debug('resolving callback');
          callback();
        }
        this.callbacks.length = 0;
        break;

      case UpdateType.Transformed:
        const { transformResolve } = this;

        if (!transformResolve) {
          debug(
            'refusing to handle "%s" for "%s" because there is no current resolver; output=%s',
            UpdateType.Transformed,
            update.filepath,
            update.output
          );
          throw new Error(
            `got '${update.type}' message without a running transform`
          );
        }

        if (update.filepath !== this.currentFilepath) {
          debug(
            'refusing to handle "%s" for "%s" because it does not match current file path "%s"',
            UpdateType.Transformed,
            update.filepath,
            this.currentFilepath
          );
          throw new Error(
            `expected '${update.type}' message for ${
              this.currentFilepath
            } but got ${update.filepath}`
          );
        }

        debug('resolving #transform promise for "%s"', update.filepath);
        this.resetAfter(() => transformResolve(update.output));
        break;

      case UpdateType.Error:
        debug(
          'received an error: type=%s message=%s stack=%s',
          update.error,
          update.message,
          update.stack
        );
        const { transformReject } = this;

        if (transformReject) {
          debug('rejecting #transform promise for "%s"', this.currentFilepath);
          this.resetAfter(() => transformReject(new Error(update.message)));
        }
        break;

      case UpdateType.Exiting:
        debug('child exiting');
        break;
    }
  }
}
