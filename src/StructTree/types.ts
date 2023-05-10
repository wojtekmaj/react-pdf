import { PDF_ROLE_TO_HTML_ROLE } from './constants';

export type PdfTagRole = keyof typeof PDF_ROLE_TO_HTML_ROLE;

export type StructTreeNode = {
  children?: StructTreeNode[];
  role?: string;
  id?: string;
  lang?: string;
  alt?: string;
};

export type StructTreeProps = {
  node: StructTreeNode;
};

export type StructTreeAttributes = {
  lang?: string;
  role?: string;
  'aria-level'?: number;
  'aria-label'?: string;
  'aria-owns'?: string;
};
