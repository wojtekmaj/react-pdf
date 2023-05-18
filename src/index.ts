import * as pdfjs from 'pdfjs-dist';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';

import type { DocumentProps } from './Document';
import type { OutlineProps } from './Outline';
import type { PageProps } from './Page';

import { displayWorkerWarning } from './shared/utils';

displayWorkerWarning();

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

export { pdfjs, Document, Outline, Page };

export type { DocumentProps, OutlineProps, PageProps };
