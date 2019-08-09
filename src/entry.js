import pdfjs from 'pdfjs-dist';
import Document from './Document';
import Outline from './Outline';
import Page from './Page';
import makeSetOptions from './setOptions';

import { isLocalFileSystem, warnOnDev } from './shared/utils';

if (isLocalFileSystem) {
  // eslint-disable-next-line no-console
  warnOnDev('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

const setOptions = makeSetOptions(pdfjs);

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

export {
  Document,
  Outline,
  Page,
  setOptions,
};
