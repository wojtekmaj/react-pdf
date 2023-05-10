import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getAttributes } from './utils';
import type { StructTreeProps } from './types';
import type { StructTreeNode } from 'pdfjs-dist/types/src/display/api';

export default function StructTree({ node }: StructTreeProps) {
  const attributes = useMemo(() => getAttributes(node), [node]);

  const childNodes = useMemo(() => {
    if (
      node.children &&
      !(node.children.length === 1 && node.children[0] && 'id' in node.children[0])
    ) {
      return node.children.map((child, index) => (
        // Safe to use index for key as the array is bound to the pdf structure
        // eslint-disable-next-line react/no-array-index-key
        <StructTree key={index} node={child as StructTreeNode} />
      ));
    }
    return null;
  }, [node]);

  return <span {...attributes}>{childNodes}</span>;
}

StructTree.propTypes = {
  node: PropTypes.shape({
    children: PropTypes.array,
    role: PropTypes.string,
    alt: PropTypes.string,
    lang: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
};
