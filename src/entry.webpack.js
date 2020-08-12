import pdfjs from 'pdfjs-dist/build/pdf';
import Document from './Document';
import Outline from './Outline';
import Page from './Page';
import PdfjsWorker from './pdf.worker.entry';

import { isLocalFileSystem, warnOnDev } from './shared/utils';

if (isLocalFileSystem) {
  warnOnDev('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = PdfjsWorker;
}

export {
  pdfjs,
  Document,
  Outline,
  Page,
};
