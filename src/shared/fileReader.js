/* eslint-disable import/prefer-default-export */

export const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
  reader.readAsArrayBuffer(file);
});
