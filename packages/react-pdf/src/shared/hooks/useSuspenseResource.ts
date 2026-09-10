import { use, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react';

import { isBrowser } from '../utils.js';

import type ResourceCache from '../ResourceCache.js';
import type { Resource, Task } from '../ResourceCache.js';

export type ResourceRequest<K extends readonly unknown[], T> = {
  cache: ResourceCache<K, T>;
  key: NoInfer<K>;
  load: () => Task<T>;
};

export default function useSuspenseResource<K extends readonly unknown[], T>(
  request: ResourceRequest<K, T> | undefined,
  onError?: (error: Error) => void,
): T | undefined {
  const notifiedResource = useRef<Resource<K, T> | undefined>(undefined);
  const [previousResource, setResource] = useState(() =>
    request?.cache.getOrCreate(request.key, request.load),
  );
  let resource = previousResource;

  // Committed state owns the load; initial Suspense retries share the cache.
  if (request ? !resource?.matches(request.key) : resource) {
    resource = request?.cache.getOrCreate(request.key, request.load);
    setResource(resource);
  }

  // Ownership lasts until unmount. Insertion Effects stay connected while
  // Suspense or Activity hides a viewer and preserves its component state.
  useInsertionEffect(() => {
    if (!resource) {
      return;
    }

    return resource.retain();
  }, [resource]);

  const result = resource ? use(resource.promise) : undefined;

  // Commit ownership before the boundary handles the failure. Its unmount then
  // releases the failed load, allowing a normal boundary reset to retry it.
  useLayoutEffect(() => {
    if (result?.error) {
      if (onError && notifiedResource.current !== resource) {
        notifiedResource.current = resource;
        onError(result.error);
      }

      throw result.error;
    }
  }, [onError, resource, result]);

  // Server rendering has no commit phase to propagate the error.
  if (!isBrowser && result?.error) {
    throw result.error;
  }

  return result?.value;
}
