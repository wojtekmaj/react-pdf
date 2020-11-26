import * as pdfjs from 'pdfjs-dist';
import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { isLocalFileSystem, warnOnDev } from './shared/utils';

if (isLocalFileSystem) {
  // eslint-disable-next-line no-console
  warnOnDev('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker('./pdf.worker.entry.js');
}

export {
  pdfjs,
  Document,
  Outline,
  Page,
};
