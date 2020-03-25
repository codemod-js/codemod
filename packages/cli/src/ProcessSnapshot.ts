import Module = NodeJS.Module

interface MapDiff<K, V> {
  added: Map<K, V>
  modified: Map<K, [V, V]>
  deleted: Map<K, V>
}

type CacheSnapshot = Map<string, Module>
type ExtensionSnapshot = Map<string, typeof require.extensions['.js']>
type EventsSnapshot = Map<
  string | symbol,
  Array<(...args: Array<unknown>) => void>
>

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
  private readonly cacheEntries: CacheSnapshot
  private readonly extensions: ExtensionSnapshot
  private readonly processEvents: EventsSnapshot

  constructor(
    private readonly requireImpl: typeof require = require,
    private readonly processImpl: typeof process = process,
    private readonly originalGlobal: typeof global = global,
    private readonly log: typeof console.log = () => {
      // no logging by default
    }
  ) {
    this.cacheEntries = this.snapshotRequireCache()
    this.extensions = this.snapshotRequireExtensions()
    this.processEvents = this.snapshotProcessEvents()
    this.originalGlobal.global = Object.create(originalGlobal)
  }

  /**
   * Restores the snapshot that was captured on construction.
   */
  restore(): void {
    this.restoreRequireCache()
    this.restoreExtensions()
    this.restoreProcessEvents()
    this.restoreGlobal()
  }

  /**
   * Helper to diff two maps used as snapshots.
   */
  private static diffMaps<K, V>(
    before: Map<K, V>,
    after: Map<K, V>
  ): MapDiff<K, V> {
    const added = new Map<K, V>()
    const modified = new Map<K, [V, V]>()
    const deleted = new Map<K, V>()

    for (const [beforeKey, beforeValue] of before) {
      const afterValue = after.get(beforeKey)
      if (after.has(beforeKey)) {
        if (afterValue !== beforeValue) {
          modified.set(beforeKey, [beforeValue, afterValue as V])
        }
      } else {
        deleted.set(beforeKey, beforeValue)
      }
    }

    for (const [afterKey, afterValue] of after) {
      if (!before.has(afterKey)) {
        added.set(afterKey, afterValue)
      }
    }

    return { added, modified, deleted }
  }

  /**
   * Restores `require.cache` in place.
   */
  private restoreRequireCache(): void {
    const { cache } = this.requireImpl
    const { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.cacheEntries,
      this.snapshotRequireCache()
    )

    for (const key of added.keys()) {
      this.log(`removing ${key} from require cache`)
      delete cache[key]
    }

    for (const [key, [original]] of modified) {
      this.log(`restoring replaced ${key} in require cache`)
      cache[key] = original
    }

    for (const [key, original] of deleted) {
      this.log(`restoring deleted ${key} to require cache`)
      cache[key] = original
    }
  }

  /**
   * Restores `require.extensions` in place.
   */
  private restoreExtensions(): void {
    const { extensions } = this.requireImpl
    const { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.extensions,
      this.snapshotRequireExtensions()
    )

    for (const key of added.keys()) {
      this.log(`removing ${key} from require extensions`)
      delete extensions[key]
    }

    for (const [key, [original]] of modified) {
      this.log(`restoring replaced ${key} in require extensions`)
      extensions[key] = original
    }

    for (const [key, original] of deleted) {
      this.log(`restoring deleted ${key} to require extensions`)
      extensions[key] = original
    }
  }

  /**
   * Restores `process` events using the `EventEmitter` API.
   */
  private restoreProcessEvents(): void {
    const process = this.processImpl
    const { added, modified, deleted } = ProcessSnapshot.diffMaps(
      this.processEvents,
      this.snapshotProcessEvents()
    )

    for (const event of added.keys()) {
      this.log(`removing all '${event.toString()}' event listeners`)
      process.removeAllListeners(event)
    }

    for (const [event, [original, updated]] of modified) {
      for (const originalEntry of original) {
        if (!updated.includes(originalEntry)) {
          this.log(`restoring removed '${event.toString()}' event listener`)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          process.addListener(event as any, originalEntry)
        }
      }

      for (const updatedEntry of updated) {
        if (!original.includes(updatedEntry)) {
          this.log(`removing added '${event.toString()}' event listener`)
          process.removeListener(event, updatedEntry)
        }
      }
    }

    for (const [event, callbacks] of deleted) {
      for (const callback of callbacks) {
        this.log(`restoring removed '${event.toString()}' event listener`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        process.addListener(event as any, callback)
      }
    }
  }

  /**
   * Restores the state of the `global` object.
   */
  private restoreGlobal(): void {
    this.originalGlobal.global = this.originalGlobal
  }

  /**
   * Snapshots the current state of `require.cache`.
   */
  private snapshotRequireCache(): CacheSnapshot {
    const result: CacheSnapshot = new Map()
    const { cache } = this.requireImpl

    for (const path in cache) {
      if (Object.prototype.hasOwnProperty.call(cache, path)) {
        result.set(path, cache[path])
      }
    }

    return result
  }

  /**
   * Snapshots the current state of `require.extensions`.
   */
  private snapshotRequireExtensions(): ExtensionSnapshot {
    const result: ExtensionSnapshot = new Map()
    const { extensions } = this.requireImpl

    for (const key in extensions) {
      if (Object.prototype.hasOwnProperty.call(extensions, key)) {
        result.set(key, extensions[key])
      }
    }

    return result
  }

  /**
   * Snapshots the current state of `process` events.
   */
  private snapshotProcessEvents(): EventsSnapshot {
    const result: EventsSnapshot = new Map()
    const events = this.processImpl.eventNames()

    for (const name of events) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.set(name, this.processImpl.listeners(name as any))
    }

    return result
  }
}
