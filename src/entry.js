import Document from './Document';
import Outline from './Outline';
import Page from './Page';

const pdfjs = require('pdfjs-dist');
require('pdfjs-dist/web/compatibility');

pdfjs.PDFJS.workerSrc = 'pdf.worker.js';

export {
  Document,
  Outline,
  Page,
};
