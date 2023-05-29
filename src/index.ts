import * as pdfjs from 'pdfjs-dist';
import { displayWorkerWarning } from './shared/utils';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

export type { DocumentProps } from './Document';
export type { OutlineProps } from './Outline';
export type { PageProps } from './Page';

export { useDocument } from './DocumentContext';
export { useOutline } from './OutlineContext';
export { usePage } from './PageContext';

export { pdfjs, Document, Outline, Page };

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
