import { dataURItoByteString } from 'react-pdf/src/shared/utils';

function dataURItoUint8Array(dataURI) {
  const byteString = dataURItoByteString(dataURI);

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
}

/**
 * Parses data URI to Blob.
 *
 * @param {string} dataURI
 */
export function dataURItoBlob(dataURI) {
  const ia = dataURItoUint8Array(dataURI);
  const [header] = dataURI.split(';');
  const mimeString = header.split(':')[1];
  return new Blob([ia], { type: mimeString });
}
