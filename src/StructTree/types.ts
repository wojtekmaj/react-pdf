import { PDF_ROLE_TO_HTML_ROLE } from './constants';

import type { StructTreeNode } from 'pdfjs-dist/types/src/display/api';

export type PdfTagRole = keyof typeof PDF_ROLE_TO_HTML_ROLE;

export type StructTreeAttributes = {
  'aria-level'?: number;
  'aria-label'?: string;
  'aria-owns'?: string;
  lang?: string;
  role?: string;
};

export type StructTreeNodeWithExtraAttributes = StructTreeNode & {
  alt?: string;
  lang?: string;
};
