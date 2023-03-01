import * as pdfjs from 'pdfjs-dist/build/pdf';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);

export { pdfjs, Document, Outline, Page };
