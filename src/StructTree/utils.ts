import { HEADING_PATTERN, PDF_ROLE_TO_HTML_ROLE } from './constants';

import type { StructTreeContent } from 'pdfjs-dist/types/src/display/api';
import type { PdfTagRole, StructTreeAttributes, StructTreeNodeWithExtraAttributes } from './types';

export function isStructTreeNode(
  node: StructTreeNodeWithExtraAttributes | StructTreeContent,
): node is StructTreeNodeWithExtraAttributes {
  return 'children' in node;
}

export function isStructTreeNodeWithOnlyContentChild(
  node: StructTreeNodeWithExtraAttributes | StructTreeContent,
): boolean {
  if (!isStructTreeNode(node)) {
    return false;
  }

  return Boolean(node.children.length === 1 && node.children[0] && 'id' in node.children[0]);
}

export function getRoleAttributes(
  node?: StructTreeNodeWithExtraAttributes | StructTreeContent,
): StructTreeAttributes {
  const attributes: StructTreeAttributes = {};

  if (!node) {
    return attributes;
  }

  if ('role' in node) {
    const { role } = node;

    const match = role?.match(HEADING_PATTERN);

    if (match) {
      attributes.role = 'heading';
      attributes['aria-level'] = Number(match[1]);
    } else if (PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole]) {
      attributes.role = PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole] ?? undefined;
    }
  }

  return attributes;
}

export function getStandardAttributes(
  node?: StructTreeNodeWithExtraAttributes | StructTreeContent,
): StructTreeAttributes {
  const attributes: StructTreeAttributes = {};

  if (!node) {
    return attributes;
  }

  if ('alt' in node && node.alt !== undefined) {
    attributes['aria-label'] = node.alt;
  }

  if ('lang' in node && node.lang !== undefined) {
    attributes.lang = node.lang;
  }

  if ('id' in node) {
    attributes['aria-owns'] = node.id;
  }

  if (isStructTreeNode(node) && isStructTreeNodeWithOnlyContentChild(node)) {
    const contentChild = node.children[0];

    return {
      ...attributes,
      ...getStandardAttributes(contentChild),
    };
  }

  return attributes;
}

export function getAttributes(
  node?: StructTreeNodeWithExtraAttributes | StructTreeContent | false,
) {
  if (!node) {
    return null;
  }

  return {
    ...getRoleAttributes(node),
    ...getStandardAttributes(node),
  };
}
