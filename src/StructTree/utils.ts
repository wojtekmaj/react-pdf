import { HEADING_PATTERN, PDF_ROLE_TO_HTML_ROLE } from './constants';

import type { StructTreeContent, StructTreeNode } from 'pdfjs-dist/types/src/display/api';
import type { PdfTagRole, StructTreeAttributes } from './types';

export function getRoleAttributes(node: StructTreeNode) {
  const attributes: StructTreeAttributes = {};

  const { role } = node;

  const match = role?.match(HEADING_PATTERN);

  if (match) {
    attributes.role = 'heading';
    attributes['aria-level'] = Number(match[1]);
  } else if (PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole]) {
    attributes.role = PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole] ?? undefined;
  }

  return attributes;
}

export function getStandardAttributes(
  node: StructTreeNode | StructTreeContent,
): StructTreeAttributes {
  const attributes: StructTreeAttributes = {};

  // TODO: Uncomment if possible to prove these node properties can exist
  /*
  if (node.alt !== undefined) {
    attributes['aria-label'] = node.alt;
  }

  if (node.lang !== undefined) {
    attributes.lang = node.lang;
  }
  */

  if ('id' in node) {
    attributes['aria-owns'] = node.id;
  }

  if (
    'children' in node &&
    node.children.length === 1 &&
    node.children[0] &&
    'type' in node.children[0] &&
    node.children[0].type === 'content'
  ) {
    const contentChild = node.children[0];

    return {
      ...attributes,
      ...getStandardAttributes(contentChild),
    };
  }

  return attributes;
}

export function getAttributes(node?: StructTreeNode | false) {
  if (!node) {
    return null;
  }

  return {
    ...getRoleAttributes(node),
    ...getStandardAttributes(node),
  };
}
