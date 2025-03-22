import { vi } from 'vitest';
import { server } from '@vitest/browser/context';

const { readFile } = server.commands;

function makeAsyncCallbackWithoutValue<T extends unknown[]>() {
  let promiseResolve: (args: T) => void;
  const promise = new Promise<T>((resolve) => {
    promiseResolve = resolve;
  });
  type Func = (...args: T) => void;
  const func: Func = vi.fn((...args: T) => promiseResolve(args));

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

export async function loadPDF(path: string) {
  const raw = await readFile(path, 'binary');

  // Convert binary read as string to ArrayBuffer
  const arrayBuffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    arrayBuffer[i] = raw.charCodeAt(i) & 0xff;
  }

  return {
    raw,
    get arrayBuffer() {
      return arrayBuffer.buffer.slice(0);
    },
    get blob() {
      return new Blob([arrayBuffer], { type: 'application/pdf' });
    },
    get data() {
      return new Uint8Array(arrayBuffer);
    },
    get dataURI() {
      return `data:application/pdf;base64,${btoa(raw)}`;
    },
    get file() {
      return new File([arrayBuffer], 'test.pdf', { type: 'application/pdf' });
    },
  };
}

export function muteConsole() {
  vi.spyOn(globalThis.console, 'log').mockImplementation(() => {
    // Intentionally empty
  });
  vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
    // Intentionally empty
  });
  vi.spyOn(globalThis.console, 'warn').mockImplementation(() => {
    // Intentionally empty
  });
}

export function restoreConsole() {
  vi.mocked(globalThis.console.log).mockRestore();
  vi.mocked(globalThis.console.error).mockRestore();
  vi.mocked(globalThis.console.warn).mockRestore();
}
