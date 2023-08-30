import React, { useMemo } from 'react';

import {
  getAttributes,
  isStructTreeNode,
  isStructTreeNodeWithOnlyContentChild,
} from './shared/structTreeUtils.js';

import type { StructTreeContent } from 'pdfjs-dist/types/src/display/api.js';
import type { StructTreeNodeWithExtraAttributes } from './shared/types.js';

type StructTreeItemProps = {
  className?: string;
  node: StructTreeNodeWithExtraAttributes | StructTreeContent;
};

export default function StructTreeItem({ className, node }: StructTreeItemProps) {
  const attributes = useMemo(() => getAttributes(node), [node]);

  const children = useMemo(() => {
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
  }, [node]);

  return (
    <span className={className} {...attributes}>
      {children}
    </span>
  );
}
