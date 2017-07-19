/**
 * Checks if we're running in a browser environment.
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Checks whether we're running from a local file system.
 */
export const isLocalFileSystem = isBrowser && window.location.protocol === 'file:';

/**
 * Checks whether a variable is defined.
 *
 * @param {*} variable Variable to check
 */
export const isDefined = variable => typeof variable !== 'undefined';

/**
 * Checks whether a variable is defined and not null.
 *
 * @param {*} variable Variable to check
 */
export const isProvided = variable => isDefined(variable) && variable !== null;

/**
 * Checkes whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */
export const isString = variable => typeof variable === 'string';

/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */
export const isArrayBuffer = variable => variable instanceof ArrayBuffer;

/**
 * Checkes whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */
export const isBlob = (variable) => {
  if (!isBrowser()) {
    throw new Error('Attempted to check if a variable is a Blob on a non-browser environment.');
  }

  return variable instanceof Blob;
};

/**
 * Checkes whether a variable provided is a File.
 *
 * @param {*} variable Variable to check
 */
export const isFile = (variable) => {
  if (!isBrowser()) {
    throw new Error('Attempted to check if a variable is a Blob on a non-browser environment.');
  }

  return variable instanceof File;
};

/**
 * Checks whether a string provided is a data URI.
 *
 * @param {String} str String to check
 */
export const isDataURI = str => isString(str) && /^data:/.test(str);

export const isParamObject = file =>
  file instanceof Object && ('data' in file || 'range' in file || 'url' in file);

/**
 * Parses data URI to Blob.
 *
 * @param {String} dataURI
 */
export const dataURItoBlob = (dataURI) => {
  if (!isDataURI(dataURI)) {
    throw new Error('getDataURItoBlob was provided with an argument which is not a valid data URI.');
  }

  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};

/**
 * Creates an URL of a Blob.
 *
 * @param {Blob} blob Blob from which an URL shall be created
 */
export const getBlobURL = (blob) => {
  if (!isBlob(blob)) {
    throw new Error('getBlobURL was provided with an argument which is not a Blob.');
  }

  return URL.createObjectURL(blob);
};

export const dataURItoURL = dataURI => getBlobURL(dataURItoBlob(dataURI));

/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */
export const callIfDefined = (fn, args) => {
  if (fn && typeof fn === 'function') {
    fn(args);
  }
};

export const getPixelRatio = () => window.devicePixelRatio || 1;
