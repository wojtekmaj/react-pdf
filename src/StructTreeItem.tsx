import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  getAttributes,
  isStructTreeNode,
  isStructTreeNodeWithOnlyContentChild,
} from './StructTree/utils';

import type { StructTreeContent } from 'pdfjs-dist/types/src/display/api';
import type { StructTreeNodeWithExtraAttributes } from './StructTree/types';

type StructTreeItemProps = {
  node: StructTreeNodeWithExtraAttributes | StructTreeContent;
};

export default function StructTreeItem({ node }: StructTreeItemProps) {
  const attributes = useMemo(() => getAttributes(node), [node]);

  const children = (() => {
    if (!isStructTreeNode(node)) {
      return null;
    }

    if (isStructTreeNodeWithOnlyContentChild(node)) {
      return null;
    }

    return node.children.map((child, index) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <StructTreeItem key={index} node={child} />
      );
    });
  })();

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
