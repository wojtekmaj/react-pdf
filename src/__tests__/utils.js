// eslint-disable-next-line import/prefer-default-export
export const makeAsyncCallback = (callbackValue) => {
  let promiseResolve;
  const promise = new Promise((resolve) => {
    promiseResolve = resolve;
  });
  const func = jest.fn(
    callbackValue ?
      () => promiseResolve(callbackValue) :
      (...args) => promiseResolve(args.length === 1 ? args[0] : args),
  );

  return { promise, func };
};

export const loadPDF = (path) => {
  const fs = require('fs');

  const raw = fs.readFileSync(path);

  const arrayBuffer = raw.buffer;
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const file = new File([arrayBuffer], { type: 'application/pdf' });
  const dataURI = `data:application/pdf;base64,${raw.toString('base64')}`;

  return {
    raw,
    arrayBuffer,
    blob,
    file,
    dataURI,
  };
};

export const muteConsole = () => {
  global.consoleBackup = global.console;

  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
};

export const restoreConsole = () => {
  global.console = global.consoleBackup;
};
