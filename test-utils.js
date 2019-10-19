const fs = require('fs');

export const makeAsyncCallback = (callbackValue) => {
  let promiseResolve;
  const promise = new Promise((resolve) => {
    promiseResolve = resolve;
  });
  const func = jest.fn(
    callbackValue
      ? () => promiseResolve(callbackValue)
      : (...args) => promiseResolve(args.length === 1 ? args[0] : args),
  );

  return { promise, func };
};

export const loadPDF = (path) => {
  const raw = fs.readFileSync(path);
  const arrayBuffer = raw.buffer;

  return {
    raw,
    arrayBuffer,
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
      return new File([arrayBuffer], { type: 'application/pdf' });
    },
  };
};

export const muteConsole = () => {
  jest.spyOn(global.console, 'log').mockImplementation(() => {});
  jest.spyOn(global.console, 'error').mockImplementation(() => {});
  jest.spyOn(global.console, 'warn').mockImplementation(() => {});
};

export const restoreConsole = () => {
  global.console.log.mockClear();
  global.console.error.mockClear();
  global.console.warn.mockClear();
};
