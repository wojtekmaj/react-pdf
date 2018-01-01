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
