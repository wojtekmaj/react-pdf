import React, { useEffect } from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';

import StructTreeItem from './StructTreeItem';

import usePageContext from './shared/hooks/usePageContext';
import useResolver from './shared/hooks/useResolver';
import { cancelRunningTask } from './shared/utils';

import type { StructTreeNode } from 'pdfjs-dist/types/src/display/api';

export default function StructTree() {
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const [structTreeState, structTreeDispatch] = useResolver<StructTreeNode>();
  const { value: structTree } = structTreeState;

  const { customTextRenderer, page } = pageContext;

  function loadStructTree() {
    if (customTextRenderer) {
      // TODO: Document why this is necessary
      return;
    }

    if (!page) {
      return;
    }

    const cancellable = makeCancellable(page.getStructTree());
    const runningTask = cancellable;

    cancellable.promise
      .then((nextStructTree) => {
        structTreeDispatch({ type: 'RESOLVE', value: nextStructTree });
      })
      .catch((error) => {
        structTreeDispatch({ type: 'REJECT', error });
      });

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadStructTree, [customTextRenderer, page, structTreeDispatch]);

  if (!structTree) {
    return null;
  }

  return <StructTreeItem node={structTree} />;
}
