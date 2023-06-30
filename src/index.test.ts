import * as pdfjs from 'pdfjs-dist';

import Document from './Document';
import Outline from './Outline';
import Page from './Page';
import Thumbnail from './Thumbnail';

import useDocumentContext from './shared/hooks/useDocumentContext';
import useOutlineContext from './shared/hooks/useOutlineContext';
import usePageContext from './shared/hooks/usePageContext';

export type { DocumentProps } from './Document';
export type { OutlineProps } from './Outline';
export type { PageProps } from './Page';
export type { ThumbnailProps } from './Thumbnail';

import './pdf.worker.entry';

export {
  pdfjs,
  Document,
  Outline,
  Page,
  Thumbnail,
  useDocumentContext,
  useOutlineContext,
  usePageContext,
};
