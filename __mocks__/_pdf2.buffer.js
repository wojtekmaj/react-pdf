// Loads a PDF file as a Buffer.

const fs = require('fs');

const file = fs.readFileSync('./__mocks__/_pdf2.pdf');

const fileArrayBuffer = file.buffer;
const fileBlob = new Blob([fileArrayBuffer], { type: 'application/pdf' });
const fileFile = new File([fileArrayBuffer], { type: 'application/pdf' });
const fileDataURI = `data:application/pdf;base64,${file.toString('base64')}`;

export {
  file,
  fileArrayBuffer,
  fileBlob,
  fileFile,
  fileDataURI,
};
