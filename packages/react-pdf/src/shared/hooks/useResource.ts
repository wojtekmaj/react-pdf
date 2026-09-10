import { useEffect } from 'react';

import useResolver from './useResolver.js';
import useSuspenseResource from './useSuspenseResource.js';

import type { Task } from '../ResourceCache.js';
import type { State } from './useResolver.js';
import type { ResourceRequest } from './useSuspenseResource.js';

/** Loads through Suspense or an Effect, using the same loader in either mode. */
export default function useResource<K extends readonly unknown[], T>(
  request: ResourceRequest<K, T> | undefined,
  suspense: boolean,
  onError?: (error: Error) => void,
): State<T> {
  const [state, dispatch] = useResolver<T>();
  const value = useSuspenseResource(suspense ? request : undefined, onError);
  const load = request?.load;

  // Callers memoize the loader with its inputs. Callback changes alone should
  // not restart a load, and Suspense uses the cache's input comparison instead.
  useEffect(() => {
    dispatch({ type: 'RESET' });

    if (suspense || !load) {
      return;
    }

    let active = true;
    let task: Task<T> | undefined;

    const loadResource = async () => {
      if (!active) {
        return;
      }

      try {
        task = load();
        const nextValue = await task.promise;

        if (active) {
          dispatch({ type: 'RESOLVE', value: nextValue });
        }
      } catch (reason) {
        if (active) {
          const error = reason instanceof Error ? reason : new Error(String(reason));

          dispatch({ type: 'REJECT', error });
        }
      }
    };

    // Strict Mode can disconnect the Effect before a task needs to be started.
    void Promise.resolve().then(loadResource);

    return () => {
      active = false;
      void Promise.resolve()
        .then(() => task?.dispose?.())
        .catch(() => {});

      // A disposed document must not survive a mode change or Activity reveal.
      dispatch({ type: 'RESET' });
    };
  }, [dispatch, load, suspense]);

  return suspense ? { value, error: undefined } : state;
}
