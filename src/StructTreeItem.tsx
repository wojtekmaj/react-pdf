import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { getAttributes } from './StructTree/utils';

import type { StructTreeNode } from 'pdfjs-dist/types/src/display/api';

type StructTreeItemProps = {
  node: StructTreeNode;
};

export default function StructTreeItem({ node }: StructTreeItemProps) {
  const attributes = useMemo(() => getAttributes(node), [node]);

  const children = useMemo(() => {
    return node.children.map((child, index) => {
      if (!child) {
        return null;
      }

      if (!('children' in child)) {
        return null;
      }

      return (
        // eslint-disable-next-line react/no-array-index-key
        <StructTreeItem key={index} node={child} />
      );
    });
  }, [node]);

  return <span {...attributes}>{children}</span>;
}

StructTreeItem.propTypes = {
  node: PropTypes.oneOfType([
    PropTypes.shape({
      children: PropTypes.object,
      role: PropTypes.string,
    }),
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
    }),
  ]).isRequired,
};
