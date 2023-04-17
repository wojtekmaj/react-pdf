import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import OutlineItem from './OutlineItem';

import { cancelRunningTask } from './shared/utils';

import { useResolver } from './shared/hooks';
import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { OnItemClickArgs } from './shared/types';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

type EventProps = ReturnType<typeof makeEventProps>;

type OutlineProps = {
  className?: string;
  inputRef?: React.RefObject<HTMLDivElement>;
  onItemClick?: (props: OnItemClickArgs) => void;
  onLoadError?: (error: Error) => void;
  onLoadSuccess?: (outline: PDFOutline | null) => void;
  pdf?: PDFDocumentProxy | false;
} & EventProps;

export default function Outline(props: OutlineProps) {
  const context = useContext(DocumentContext);

  invariant(context, 'Unable to find Document context. Did you wrap <Outline /> in <Document />?');

  const mergedProps = { ...context, ...props };
  const {
    className,
    inputRef,
    onItemClick: onItemClickProps,
    onLoadError: onLoadErrorProps,
    onLoadSuccess: onLoadSuccessProps,
    pdf,
    ...otherProps
  } = mergedProps;

  invariant(pdf, 'Attempted to load an outline, but no document was specified.');

  const [outlineState, outlineDispatch] = useResolver<PDFOutline | null>();
  const { value: outline, error: outlineError } = outlineState;

  /**
   * Called when an outline is read successfully
   */
  function onLoadSuccess() {
    if (typeof outline === 'undefined' || outline === false) {
      return;
    }

    if (onLoadSuccessProps) {
      onLoadSuccessProps(outline);
    }
  }

  /**
   * Called when an outline failed to read successfully
   */
  function onLoadError() {
    if (!outlineError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, outlineError.toString());

    if (onLoadErrorProps) {
      onLoadErrorProps(outlineError);
    }
  }

  function onItemClick({ dest, pageIndex, pageNumber }: OnItemClickArgs) {
    if (onItemClickProps) {
      onItemClickProps({
        dest,
        pageIndex,
        pageNumber,
      });
    }
  }

  function resetOutline() {
    outlineDispatch({ type: 'RESET' });
  }

  useEffect(resetOutline, [outlineDispatch, pdf]);

  function loadOutline() {
    if (!pdf) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    const cancellable = makeCancellable(pdf.getOutline());
    const runningTask = cancellable;

    cancellable.promise
      .then((nextOutline) => {
        outlineDispatch({ type: 'RESOLVE', value: nextOutline });
      })
      .catch((error) => {
        outlineDispatch({ type: 'REJECT', error });
      });

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadOutline, [outlineDispatch, pdf]);

  useEffect(
    () => {
      if (outline === undefined) {
        return;
      }

      if (outline === false) {
        onLoadError();
        return;
      }

      onLoadSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outline],
  );

  const childContext = {
    onClick: onItemClick,
  };

  const eventProps = useMemo(
    () => makeEventProps(otherProps, () => outline),
    [otherProps, outline],
  );

  if (!outline) {
    return null;
  }

  function renderOutline() {
    if (!outline) {
      return null;
    }

    return (
      <ul>
        {outline.map((item, itemIndex) => (
          <OutlineItem key={typeof item.dest === 'string' ? item.dest : itemIndex} item={item} />
        ))}
      </ul>
    );
  }

  return (
    <div className={clsx('react-pdf__Outline', className)} ref={inputRef} {...eventProps}>
      <OutlineContext.Provider value={childContext}>{renderOutline()}</OutlineContext.Provider>
    </div>
  );
}

Outline.propTypes = {
  className: isClassName,
  inputRef: isRef,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventProps,
};
