import React, { useEffect, useMemo, useState } from 'react';
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

import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes';

export function OutlineInternal({
  className,
  inputRef,
  onItemClick: onItemClickProps,
  onLoadError: onLoadErrorProps,
  onLoadSuccess: onLoadSuccessProps,
  pdf,
  ...otherProps
}) {
  const [outline, setOutline] = useState(undefined);
  const [outlineError, setOutlineError] = useState(undefined);

  invariant(pdf, 'Attempted to load an outline, but no document was specified.');

  /**
   * Called when an outline is read successfully
   */
  function onLoadSuccess() {
    if (onLoadSuccessProps) {
      onLoadSuccessProps(outline);
    }
  }

  /**
   * Called when an outline failed to read successfully
   */
  function onLoadError() {
    warning(false, outlineError);

    if (onLoadErrorProps) {
      onLoadErrorProps(outlineError);
    }
  }

  function onItemClick({ dest, pageIndex, pageNumber }) {
    if (onItemClickProps) {
      onItemClickProps({
        dest,
        pageIndex,
        pageNumber,
      });
    }
  }

  function resetOutline() {
    setOutline(undefined);
    setOutlineError(undefined);
  }

  useEffect(resetOutline, [pdf]);

  function loadOutline() {
    const cancellable = makeCancellable(pdf.getOutline());
    const runningTask = cancellable;

    cancellable.promise.then(setOutline).catch((error) => {
      setOutline(false);
      setOutlineError(error);
    });

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadOutline, [outline, pdf]);

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
    return (
      <ul>
        {outline.map((item, itemIndex) => (
          <OutlineItem
            key={typeof item.destination === 'string' ? item.destination : itemIndex}
            item={item}
          />
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

OutlineInternal.propTypes = {
  className: isClassName,
  inputRef: isRef,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventProps,
};

export default function Outline(props) {
  return (
    <DocumentContext.Consumer>
      {(context) => <OutlineInternal {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}
