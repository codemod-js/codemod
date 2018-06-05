export function installAsyncIterator() {
  // Polyfill `Symbol.asyncIterator` so `for await` will work.
  Symbol['asyncIterator' as string] =
    Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');
}
