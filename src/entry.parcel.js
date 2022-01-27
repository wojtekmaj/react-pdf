import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker('./pdf.worker.entry.js');
}

export { pdfjs, Document, Outline, Page };
