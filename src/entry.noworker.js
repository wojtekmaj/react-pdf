import Document from './Document';
import Outline from './Outline';
import Page from './Page';
import makeSetOptions from './setOptions';

const pdfjs = require('pdfjs-dist/build/pdf.combined');

const setOptions = makeSetOptions(pdfjs);

setOptions({
  disableWorker: true,
});

export {
  Document,
  Outline,
  Page,
  setOptions,
};
