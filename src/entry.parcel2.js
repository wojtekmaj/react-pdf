import * as pdfjs from 'pdfjs-dist/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker(
    new URL('./pdf.worker.entry.js', import.meta.url),
    { type: 'module' },
  );
}

export { pdfjs, Document, Outline, Page };
