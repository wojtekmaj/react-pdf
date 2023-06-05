import { PDF_ROLE_TO_HTML_ROLE } from './constants';

export type PdfTagRole = keyof typeof PDF_ROLE_TO_HTML_ROLE;

export type StructTreeAttributes = {
  lang?: string;
  role?: string;
  'aria-level'?: number;
  'aria-label'?: string;
  'aria-owns'?: string;
};
