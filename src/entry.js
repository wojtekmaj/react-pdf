import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { isLocalFileSystem, warnOnDev } from './shared/utils';

if (isLocalFileSystem) {
  warnOnDev('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

export {
  pdfjs,
  Document,
  Outline,
  Page,
};
