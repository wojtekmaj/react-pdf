/* eslint-disable no-bitwise */
/* eslint-disable prefer-destructuring */
import { HEADING_PATTERN, PDF_ROLE_TO_HTML_ROLE } from './constants';
import type { StructTreeAttributes, StructTreeNode, PdfTagRole } from './types';

export const getRoleAttributes = (node: StructTreeNode) => {
  const attributes: StructTreeAttributes = {};
  if ('role' in node) {
    const { role } = node;
    const match = role?.match(HEADING_PATTERN);
    if (match) {
      attributes.role = 'heading';
      attributes['aria-level'] = Number(match[1]);
    } else if (role && PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole]) {
      attributes.role = PDF_ROLE_TO_HTML_ROLE[role as PdfTagRole] ?? undefined;
    }
  }
  return attributes;
};

export const getStandardAttributes = (node: StructTreeNode): StructTreeAttributes => {
  const attributes: StructTreeAttributes = {};
  if (node.alt !== undefined) {
    attributes['aria-label'] = node.alt;
  }
  if (node.lang !== undefined) {
    attributes.lang = node.lang;
  }
  if (node.id !== undefined) {
    attributes['aria-owns'] = node.id;
  }
  if (node.children?.length === 1 && node.children[0] && 'id' in node.children[0]) {
    return { ...attributes, ...getStandardAttributes(node.children[0]) };
  }
  return attributes;
};

export const getAttributes = (node: StructTreeNode) => {
  if (node) {
    return { ...getRoleAttributes(node), ...getStandardAttributes(node) };
  }
};
