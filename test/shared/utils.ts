import invariant from 'tiny-invariant';

/**
 * Checks if we're running in a browser environment.
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Checks whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */
export function isString(variable: unknown): variable is string {
  return typeof variable === 'string';
}

/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */
export function isArrayBuffer(variable: unknown): variable is ArrayBuffer {
  return variable instanceof ArrayBuffer;
}

/**
 * Checks whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */
export function isBlob(variable: unknown): variable is Blob {
  invariant(isBrowser, 'isBlob can only be used in a browser environment');

  return variable instanceof Blob;
}

/**
 * Checks whether a variable provided is a data URI.
 *
 * @param {*} variable String to check
 */
export function isDataURI(variable: unknown): variable is `data:${string}` {
  return isString(variable) && variable.startsWith('data:');
}

export function loadFromFile(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        return reject(new Error('Error while reading a file.'));
      }

      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = (event) => {
      if (!event.target) {
        return reject(new Error('Error while reading a file.'));
      }

      const { error } = event.target;

      if (!error) {
        return reject(new Error('Error while reading a file.'));
      }

      switch (error.code) {
        case error.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'));
        case error.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'));
        case error.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'));
        default:
          return reject(new Error('Error while reading a file.'));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}
