import { dataURItoUint8Array } from '../../src/shared/utils';

/* eslint-disable import/prefer-default-export */

/**
 * Parses data URI to Blob.
 *
 * @param {String} dataURI
 */
export const dataURItoBlob = (dataURI) => {
  const ia = dataURItoUint8Array(dataURI);
  const [mimeString] = dataURI.split(',')[0].split(':')[1].split(';');
  return new Blob([ia], { type: mimeString });
};
