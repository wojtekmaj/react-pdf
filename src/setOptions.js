const allowedProperties = [
  'cMapUrl',
  'cMapPacked',
  'disableWorker',
  'workerSrc',
  'workerPort',
];

const makeSetOptions = pdfjs => (options) => {
  if (!(options instanceof Object)) {
    return;
  }

  /* eslint-disable no-param-reassign */
  Object.keys(options)
    .filter(property => allowedProperties.includes(property))
    .forEach((property) => {
      pdfjs.PDFJS[property] = options[property];
    });
};

export default makeSetOptions;
