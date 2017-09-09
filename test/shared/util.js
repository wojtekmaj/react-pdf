import { isDataURI } from '../../src/shared/util';

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

  const [mimeString] = dataURI.split(',')[0].split(':')[1].split(';');

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};
