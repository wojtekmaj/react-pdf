import Document from './Document';
import Outline from './Outline';
import Page from './Page';

const pdfjs = require('pdfjs-dist/build/pdf.combined');

pdfjs.PDFJS.disableWorker = true;

export {
  Document,
  Outline,
  Page,
};
