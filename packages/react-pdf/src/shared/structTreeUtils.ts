import { HEADING_PATTERN, PDF_ROLE_TO_HTML_ROLE } from './constants.js';

import type { StructTreeContent, StructTreeNode } from 'pdfjs-dist/types/src/display/api.js';
import type { StructTreeNodeWithExtraAttributes } from './types.js';

type PdfRole = keyof typeof PDF_ROLE_TO_HTML_ROLE;

type Attributes = React.HTMLAttributes<HTMLElement>;

export function isPdfRole(role: string): role is PdfRole {
  return role in PDF_ROLE_TO_HTML_ROLE;
}

export function isStructTreeNode(node: StructTreeNode | StructTreeContent): node is StructTreeNode {
  return 'children' in node;
}

export function isStructTreeNodeWithOnlyContentChild(
  node: StructTreeNode | StructTreeContent,
): boolean {
  if (!isStructTreeNode(node)) {
    return false;
  }

  return node.children.length === 1 && 0 in node.children && 'id' in node.children[0];
}

export function getRoleAttributes(node: StructTreeNode | StructTreeContent): Attributes {
  const attributes: Attributes = {};

  if (isStructTreeNode(node)) {
    const { role } = node;

    const matches = role.match(HEADING_PATTERN);

    if (matches) {
      attributes.role = 'heading';
      attributes['aria-level'] = Number(matches[1]);
    } else if (isPdfRole(role)) {
      const htmlRole = PDF_ROLE_TO_HTML_ROLE[role];

      if (htmlRole) {
        attributes.role = htmlRole;
      }
    }
  }

  return attributes;
}

export function getBaseAttributes(
  node: StructTreeNodeWithExtraAttributes | StructTreeContent,
): Attributes {
  const attributes: Attributes = {};

  if (isStructTreeNode(node)) {
    if (node.alt !== undefined) {
      attributes['aria-label'] = node.alt;
    }

    if (node.lang !== undefined) {
      attributes.lang = node.lang;
    }

    if (isStructTreeNodeWithOnlyContentChild(node)) {
      const [child] = node.children;

      if (child) {
        const childAttributes = getBaseAttributes(child);

        return {
          ...attributes,
          ...childAttributes,
        };
      }
    }
  } else {
    if ('id' in node) {
      attributes['aria-owns'] = node.id;
    }
  }

  return attributes;
}

export function getAttributes(
  node: StructTreeNodeWithExtraAttributes | StructTreeContent,
): Attributes | null {
  if (!node) {
    return null;
  }

  return {
    ...getRoleAttributes(node),
    ...getBaseAttributes(node),
  };
}
