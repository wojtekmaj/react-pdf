import { isDataURI } from '../../src/shared/utils';

/* eslint-disable import/prefer-default-export */

const dataURItoUint8Array = (dataURI) => {
  if (!isDataURI(dataURI)) {
    throw new Error('dataURItoUint8Array was provided with an argument which is not a valid data URI.');
  }

  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
};

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
