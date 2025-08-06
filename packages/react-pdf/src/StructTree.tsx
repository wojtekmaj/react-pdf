import { useEffect } from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'warning';

import StructTreeItem from './StructTreeItem.js';

import usePageContext from './shared/hooks/usePageContext.js';
import useResolver from './shared/hooks/useResolver.js';

import { cancelRunningTask } from './shared/utils.js';

import type { StructTreeNodeWithExtraAttributes } from './shared/types.js';

export default function StructTree(): React.ReactElement | null {
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const {
    onGetStructTreeError: onGetStructTreeErrorProps,
    onGetStructTreeSuccess: onGetStructTreeSuccessProps,
  } = pageContext;

  const [structTreeState, structTreeDispatch] = useResolver<StructTreeNodeWithExtraAttributes>();
  const { value: structTree, error: structTreeError } = structTreeState;

  const { customTextRenderer, page } = pageContext;

  function onLoadSuccess() {
    if (!structTree) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    if (onGetStructTreeSuccessProps) {
      onGetStructTreeSuccessProps(structTree);
    }
  }

  function onLoadError() {
    if (!structTreeError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, structTreeError.toString());

    if (onGetStructTreeErrorProps) {
      onGetStructTreeErrorProps(structTreeError);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect intentionally triggered on page change
  useEffect(
    function resetStructTree() {
      structTreeDispatch({ type: 'RESET' });
    },
    [structTreeDispatch, page],
  );

  useEffect(
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
    },
    [customTextRenderer, page, structTreeDispatch],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(() => {
    if (structTree === undefined) {
      return;
    }

    if (structTree === false) {
      onLoadError();
      return;
    }

    onLoadSuccess();
  }, [structTree]);

  if (!structTree) {
    return null;
  }

  return <StructTreeItem className="react-pdf__Page__structTree structTree" node={structTree} />;
}
