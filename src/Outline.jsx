import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [outline, setOutline] = useState(null);

  invariant(pdf, 'Attempted to load an outline, but no document was specified.');

  /**
   * Called when an outline is read successfully
   */
  const onLoadSuccess = useCallback(
    (nextOutline) => {
      if (onLoadSuccessProps) {
        onLoadSuccessProps(nextOutline);
      }
    },
    [onLoadSuccessProps],
  );

  /**
   * Called when an outline failed to read successfully
   */
  const onLoadError = useCallback(
    (error) => {
      setOutline(false);

      warning(false, error);

      if (onLoadErrorProps) {
        onLoadErrorProps(error);
      }
    },
    [onLoadErrorProps],
  );

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
    setOutline(null);
  }

  useEffect(resetOutline, [pdf]);

  function loadOutline() {
    const cancellable = makeCancellable(pdf.getOutline());
    const runningTask = cancellable;

    cancellable.promise
      .then((nextOutline) => {
        setOutline(nextOutline);

        // Waiting for outline to be set in state
        setTimeout(() => {
          onLoadSuccess(nextOutline);
        }, 0);
      })
      .catch(onLoadError);

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadOutline, [onLoadError, onLoadSuccess, pdf]);

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

function Outline(props, ref) {
  return (
    <DocumentContext.Consumer>
      {(context) => <OutlineInternal ref={ref} {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}

export default React.forwardRef(Outline);
