/* eslint-disable @typescript-eslint/ban-ts-comment, import/no-unresolved */
import pdfjs from 'pdfjs-dist';
// @ts-ignore-next-line
import pdfjsWorker from 'file-loader!pdfjs-dist/build/pdf.worker';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export { pdfjs, Document, Outline, Page };
