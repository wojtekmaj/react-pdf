import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker',
  import.meta.url,
);

export { pdfjs, Document, Outline, Page };
