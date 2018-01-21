import Module = NodeJS.Module;

interface MapDiff<K, V> {
  added: Map<K, V>;
  modified: Map<K, [V, V]>;
  deleted: Map<K, V>;
}

// tslint:disable no-any
type CacheSnapshot = Map<string, Module>;
type ExtensionSnapshot = Map<string, typeof require.extensions['.js']>;
type EventsSnapshot = Map<
  string | symbol,
  Array<(...args: Array<any>) => void>
>;
// tslint:enable no-any

/**
 * Snapshots various global values and allows rolling back to the snapshot.
 *
 * In particular, it:
 * - Restores `require.cache`, typically useful for allowing modules to be
 *   loaded again fresh.
 * - Restores `require.extensions`, typically useful for unloading loader hooks
 *   such as babel-register or ts-node.
 * - Restores event listeners on `process`, typically useful for preventing
 *   hooks (especially 'exit') from being called on un-cached modules.
 */
export default class ProcessSnapshot {
  private readonly cacheEntries: CacheSnapshot;
  private readonly extensions: ExtensionSnapshot;
  private readonly processEvents: EventsSnapshot;

  constructor(
    private readonly requireImpl: typeof require = require,
    private readonly processImpl: typeof process = process,
    private readonly log: typeof console.log = () => {}
  ) {
    this.cacheEntries = this.snapshotRequireCache();
    this.extensions = this.snapshotRequireExtensions();
    this.processEvents = this.snapshotProcessEvents();
  }

  /**
   * Restores the snapshot that was captured on construction.
   */
  restore(): void {
    this.restoreRequireCache();
    this.restoreExtensions();
    this.restoreProcessEvents();
  }

  /**
   * Helper to diff two maps used as snapshots.
   */
  private static diffMaps<K, V>(
    before: Map<K, V>,
    after: Map<K, V>
  ): MapDiff<K, V> {
    let added = new Map<K, V>();
    let modified = new Map<K, [V, V]>();
    let deleted = new Map<K, V>();

    for (let [beforeKey, beforeValue] of before) {
      let afterValue = after.get(beforeKey);
      if (after.has(beforeKey)) {
        if (afterValue !== beforeValue) {
          modified.set(beforeKey, [beforeValue, afterValue as V]);
        }
      } else {
        deleted.set(beforeKey, beforeValue);
      }
    }

    for (let [afterKey, afterValue] of after) {
      if (!before.has(afterKey)) {
        added.set(afterKey, afterValue);
      }
    }

    return { added, modified, deleted };
  }

  /**
   * Restores `require.cache` in place.
   */
  private restoreRequireCache(): void {
    let { cache } = this.requireImpl;
    let { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.cacheEntries,
      this.snapshotRequireCache()
    );

    for (let key of added.keys()) {
      this.log(`removing ${key} from require cache`);
      delete cache[key];
    }

    for (let [key, [original]] of modified) {
      this.log(`restoring replaced ${key} in require cache`);
      cache[key] = original;
    }

    for (let [key, original] of deleted) {
      this.log(`restoring deleted ${key} to require cache`);
      cache[key] = original;
    }
  }

  /**
   * Restores `require.extensions` in place.
   */
  private restoreExtensions(): void {
    let { extensions } = this.requireImpl;
    let { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.extensions,
      this.snapshotRequireExtensions()
    );

    for (let key of added.keys()) {
      this.log(`removing ${key} from require extensions`);
      delete extensions[key];
    }

    for (let [key, [original]] of modified) {
      this.log(`restoring replaced ${key} in require extensions`);
      extensions[key] = original;
    }

    for (let [key, original] of deleted) {
      this.log(`restoring deleted ${key} to require extensions`);
      extensions[key] = original;
    }
  }

  /**
   * Restores `process` events using the `EventEmitter` API.
   */
  private restoreProcessEvents(): void {
    let process = this.processImpl;
    let { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.processEvents,
      this.snapshotProcessEvents()
    );

    for (let event of added.keys()) {
      this.log(`removing all '${event}' event listeners`);
      process.removeAllListeners(event);
    }

    for (let [event, [original, updated]] of modified) {
      for (let originalEntry of original) {
        if (updated.indexOf(originalEntry) < 0) {
          this.log(`restoring removed '${event}' event listener`);
          process.addListener(event as any, originalEntry); // tslint:disable-line no-any
        }
      }

      for (let updatedEntry of updated) {
        if (original.indexOf(updatedEntry) < 0) {
          this.log(`removing added '${event}' event listener`);
          process.removeListener(event, updatedEntry);
        }
      }
    }

    for (let [event, callbacks] of deleted) {
      for (let callback of callbacks) {
        this.log(`restoring removed '${event}' event listener`);
        process.addListener(event as any, callback); // tslint:disable-line no-any
      }
    }
  }

  /**
   * Snapshots the current state of `require.cache`.
   */
  private snapshotRequireCache(): CacheSnapshot {
    let result: CacheSnapshot = new Map();
    let { cache } = this.requireImpl;

    for (let path in cache) {
      if (Object.prototype.hasOwnProperty.call(cache, path)) {
        result.set(path, cache[path]);
      }
    }

    return result;
  }

  /**
   * Snapshots the current state of `require.extensions`.
   */
  private snapshotRequireExtensions(): ExtensionSnapshot {
    let result: ExtensionSnapshot = new Map();
    let { extensions } = this.requireImpl;

    for (let key in extensions) {
      if (Object.prototype.hasOwnProperty.call(extensions, key)) {
        result.set(key, extensions[key]);
      }
    }

    return result;
  }

  /**
   * Snapshots the current state of `process` events.
   */
  private snapshotProcessEvents(): EventsSnapshot {
    let result: EventsSnapshot = new Map();
    let events = this.processImpl.eventNames();

    for (let name of events) {
      // tslint:disable no-any
      result.set(name, this.processImpl.listeners(name as any));
      // tslint:enable no-any
    }

    return result;
  }
}
