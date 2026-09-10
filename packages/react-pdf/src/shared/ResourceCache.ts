// Resolve errors as values so consumers can notify callbacks before React throws.
type Result<T> = { value: T; error?: never } | { value?: never; error: Error };

export type Resource<K extends readonly unknown[], T> = {
  matches: (key: K) => boolean;
  promise: Promise<Result<T>>;
  retain: () => () => void;
};

export type Task<T> = {
  promise: Promise<T>;
  dispose?: () => void | Promise<void>;
};

type Options<K extends readonly unknown[]> = {
  areKeysEqual?: (first: K, second: K) => boolean;
  /** Keep successful data when the cache is scoped to its owning document. */
  cacheResolved?: boolean;
};

type Entry<K extends readonly unknown[], T> = {
  key: K;
  resource: Resource<K, T>;
  refresh: () => void;
};

const retentionTime = 5 * 60 * 1000;

function haveSameEntries(first: readonly unknown[], second: readonly unknown[]): boolean {
  if (first.length !== second.length) {
    return false;
  }

  for (let index = 0; index < first.length; index += 1) {
    if (!Object.is(first[index], second[index])) {
      return false;
    }
  }

  return true;
}

export default class ResourceCache<K extends readonly unknown[], T> {
  private entries: Entry<K, T>[] = [];

  constructor(private options: Options<K> = {}) {}

  getOrCreate(key: K, load: () => Task<T>): Resource<K, T> {
    const areKeysEqual = this.options.areKeysEqual ?? haveSameEntries;
    const cached = this.entries.find((entry) => areKeysEqual(entry.key, key));

    if (cached) {
      cached.refresh();

      return cached.resource;
    }

    let consumers = 0;
    let timer: ReturnType<typeof setTimeout>;
    let settled = false;
    let reusable = false;
    let disposed = false;

    // Start outside the render stack, including loaders that throw synchronously.
    const taskPromise = Promise.resolve().then(load);
    const promise: Promise<Result<T>> = taskPromise
      .then((task) => task.promise)
      .then(
        (value) => {
          reusable = this.options.cacheResolved ?? false;

          return { value };
        },
        (reason: unknown) => ({
          error: reason instanceof Error ? reason : new Error(String(reason)),
        }),
      );

    const evict = () => {
      if (consumers || disposed) {
        return;
      }

      disposed = true;
      this.entries = this.entries.filter((entry) => entry.resource !== resource);

      void taskPromise.then((task) => task.dispose?.()).catch(() => {});
    };

    const refresh = () => {
      if (settled && !consumers && !disposed && !reusable) {
        clearTimeout(timer);
        timer = setTimeout(evict, retentionTime);
      }
    };

    const resource: Resource<K, T> = {
      matches: (nextKey) => !disposed && areKeysEqual(key, nextKey),
      promise,
      retain: () => {
        // Documents belong to their mounted consumers. Page and outline data
        // can stay available in a cache owned by the PDF instead.
        if (!reusable) {
          this.entries = this.entries.filter((entry) => entry.resource !== resource);
        }

        clearTimeout(timer);
        consumers += 1;

        return () => {
          consumers -= 1;

          // Strict Mode reconnects Effects before this runs. A real unmount
          // releases the load so a boundary reset can start a fresh attempt.
          if (!reusable) {
            queueMicrotask(evict);
          }
        };
      },
    };

    // Initial suspension has no mounted owner. A pending task may still be
    // waiting for a password; keep it until it settles, even if the tree leaves.
    void promise.then(() => {
      settled = true;
      refresh();
    });

    this.entries.push({ key, resource, refresh });

    return resource;
  }
}
