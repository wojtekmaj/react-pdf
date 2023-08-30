'use client';

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import OutlineContext from './OutlineContext.js';

import OutlineItem from './OutlineItem.js';

import { cancelRunningTask } from './shared/utils.js';

import useDocumentContext from './shared/hooks/useDocumentContext.js';
import useResolver from './shared/hooks/useResolver.js';
import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes.js';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { EventProps } from 'make-event-props';
import type { ClassName, OnItemClickArgs } from './shared/types.js';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

export type OutlineProps = {
  className?: ClassName;
  inputRef?: React.Ref<HTMLDivElement>;
  onItemClick?: (props: OnItemClickArgs) => void;
  onLoadError?: (error: Error) => void;
  onLoadSuccess?: (outline: PDFOutline | null) => void;
  pdf?: PDFDocumentProxy | false;
} & EventProps<PDFOutline | null | false | undefined>;

const Outline: React.FC<OutlineProps> = function Outline(props) {
  const documentContext = useDocumentContext();

  invariant(
    documentContext,
    'Unable to find Document context. Did you wrap <Outline /> in <Document />?',
  );

  const mergedProps = { ...documentContext, ...props };
  const {
    className,
    inputRef,
    onItemClick,
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

  const childContext = useMemo(
    () => ({
      onItemClick,
    }),
    [onItemClick],
  );

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
};

Outline.propTypes = {
  ...eventProps,
  className: isClassName,
  inputRef: isRef,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
};

export default Outline;
