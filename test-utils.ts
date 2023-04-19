import fs from 'node:fs';
import { vi } from 'vitest';

function makeAsyncCallbackWithoutValue<T extends unknown[]>() {
  let promiseResolve: (args: T) => void;
  const promise = new Promise<T>((resolve) => {
    promiseResolve = resolve;
  });
  type Func = (...args: T) => void;
  const func: Func = vi.fn((...args) => promiseResolve(args));

  return { func, promise };
}

function makeAsyncCallbackWithValue<T>(value: T) {
  let promiseResolve: (arg: T) => void;
  const promise = new Promise<T>((resolve) => {
    promiseResolve = resolve;
  });
  const func = vi.fn(() => promiseResolve(value));

  return { func, promise };
}

export function makeAsyncCallback<T extends unknown[]>(): ReturnType<
  typeof makeAsyncCallbackWithoutValue<T>
>;
export function makeAsyncCallback<T>(value?: T): ReturnType<typeof makeAsyncCallbackWithValue<T>>;
export function makeAsyncCallback<T>(value?: T) {
  if (value === undefined) {
    return makeAsyncCallbackWithoutValue();
  }
  return makeAsyncCallbackWithValue<T>(value);
}

export function loadPDF(path: string) {
  const raw = fs.readFileSync(path);
  const arrayBuffer = raw.buffer;

  return {
    raw,
    get arrayBuffer() {
      return new Uint8Array(raw).buffer;
    },
    get blob() {
      return new Blob([arrayBuffer], { type: 'application/pdf' });
    },
    get data() {
      return new Uint8Array(raw);
    },
    get dataURI() {
      return `data:application/pdf;base64,${raw.toString('base64')}`;
    },
    get file() {
      return new File([arrayBuffer], 'test.pdf', { type: 'application/pdf' });
    },
  };
}

export function muteConsole() {
  vi.spyOn(global.console, 'log').mockImplementation(() => {
    // Intentionally empty
  });
  vi.spyOn(global.console, 'error').mockImplementation(() => {
    // Intentionally empty
  });
  vi.spyOn(global.console, 'warn').mockImplementation(() => {
    // Intentionally empty
  });
}

export function restoreConsole() {
  vi.mocked(global.console.log).mockRestore();
  vi.mocked(global.console.error).mockRestore();
  vi.mocked(global.console.warn).mockRestore();
}
