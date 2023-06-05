import * as pdfjs from 'pdfjs-dist';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

export type { DocumentProps } from './Document';
export type { OutlineProps } from './Outline';
export type { PageProps } from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

export { pdfjs, Document, Outline, Page };
