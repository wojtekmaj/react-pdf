import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
// eslint-disable-next-line import/no-unresolved
import pdfjsWorker from 'file-loader!pdfjs-dist/legacy/build/pdf.worker';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export { pdfjs, Document, Outline, Page };
