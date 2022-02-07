import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'npm:pdfjs-dist/legacy/build/pdf.worker',
  import.meta.url,
);

pdfjs.GlobalWorkerOptions.workerPort = new Worker(
  new URL('./pdf.worker.entry.js', import.meta.url),
  { type: 'module' },
);

export { pdfjs, Document, Outline, Page };
