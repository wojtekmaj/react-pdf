/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
type Data = unknown;

type Listener = (data: Data) => void;

type ListenerEntry = {
  external: boolean;
  listener: Listener;
  once: boolean;
  removeAbortListener: (() => void) | null;
};

type Options = {
  external?: boolean;
  once?: boolean;
  signal?: AbortSignal | null;
};

export default class EventBus {
  #listeners: Record<string, ListenerEntry[] | undefined> = Object.create(null);

  on(eventName: string, listener: Listener, options: Options | null = null): void {
    this._on(eventName, listener, {
      external: true,
      once: options?.once,
      signal: options?.signal,
    });
  }

  off(eventName: string, listener: Listener, options: Options | null = null): void {
    this._off(eventName, listener, options);
  }

  dispatch(eventName: string, data: Data): void {
    const eventListeners = this.#listeners[eventName];
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }

    let externalListeners: Listener[] | undefined;
    // Making copy of the listeners array in case if it will be modified
    // during dispatch.
    for (const { listener, external, once } of eventListeners.slice(0)) {
      if (once) {
        this._off(eventName, listener);
      }

      if (external) {
        externalListeners ??= [];
        externalListeners.push(listener);
        continue;
      }

      listener(data);
    }

    // Dispatch any "external" listeners *after* the internal ones, to give the
    // viewer components time to handle events and update their state first.
    if (externalListeners) {
      for (const listener of externalListeners) {
        listener(data);
      }

      externalListeners = undefined;
    }
  }

  _on(eventName: string, listener: Listener, options: Options | null = null): void {
    let removeAbortListener = null;

    if (options?.signal instanceof AbortSignal) {
      const { signal } = options;

      if (signal.aborted) {
        return;
      }

      const onAbort = () => this._off(eventName, listener);

      removeAbortListener = () => signal.removeEventListener('abort', onAbort);

      signal.addEventListener('abort', onAbort);
    }

    let eventListeners = this.#listeners[eventName];

    if (!eventListeners) {
      eventListeners = [];
      this.#listeners[eventName] = eventListeners;
    }

    eventListeners.push({
      listener,
      external: options?.external === true,
      once: options?.once === true,
      removeAbortListener,
    });
  }

  _off(eventName: string, listener: Listener, _options: Options | null = null): void {
    const eventListeners = this.#listeners[eventName];

    if (!eventListeners) {
      return;
    }

    for (let i = 0, ii = eventListeners.length; i < ii; i++) {
      const evt = eventListeners[i];

      if (evt?.listener === listener) {
        evt.removeAbortListener?.();
        eventListeners.splice(i, 1);
        return;
      }
    }
  }
}
