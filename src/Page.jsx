import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import clsx from 'clsx';
import mergeRefs from 'merge-refs';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import DocumentContext from './DocumentContext';
import PageContext from './PageContext';

import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';

import { cancelRunningTask, isProvided, makePageCallback } from './shared/utils';

import {
  eventProps,
  isClassName,
  isPageIndex,
  isPageNumber,
  isPdf,
  isRef,
  isRenderMode,
  isRotate,
} from './shared/propTypes';

const defaultScale = 1;

export function PageInternal({
  canvasBackground,
  canvasRef,
  children,
  className,
  customTextRenderer,
  devicePixelRatio,
  error,
  height,
  inputRef,
  loading,
  noData,
  onGetAnnotationsError: onGetAnnotationsErrorProps,
  onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
  onGetTextError: onGetTextErrorProps,
  onGetTextSuccess: onGetTextSuccessProps,
  onLoadError: onLoadErrorProps,
  onLoadSuccess: onLoadSuccessProps,
  onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
  onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
  onRenderError: onRenderErrorProps,
  onRenderSuccess: onRenderSuccessProps,
  onRenderTextLayerError: onRenderTextLayerErrorProps,
  onRenderTextLayerSuccess: onRenderTextLayerSuccessProps,
  pageIndex: pageIndexProps,
  pageNumber: pageNumberProps,
  pdf,
  registerPage,
  renderAnnotationLayer: renderAnnotationLayerProps,
  renderForms,
  renderInteractiveForms,
  renderMode,
  renderTextLayer: renderTextLayerProps,
  rotate: rotateProps,
  scale: scaleProps,
  unregisterPage,
  width,
  ...otherProps
}) {
  const [page, setPage] = useState(undefined);
  const [pageError, setPageError] = useState(undefined);
  const pageElement = useRef();

  invariant(pdf, 'Attempted to load a page, but no document was specified.');

  const pageIndex = isProvided(pageNumberProps) ? pageNumberProps - 1 : pageIndexProps ?? null;

  const pageNumber = pageNumberProps ?? (isProvided(pageIndexProps) ? pageIndexProps + 1 : null);

  const rotate = rotateProps ?? (page ? page.rotate : null);

  const scale = useMemo(() => {
    if (!page) {
      return null;
    }

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // Passing scale explicitly null would cause the page not to render
    const scaleWithDefault = scaleProps ?? defaultScale;

    // If width/height is defined, calculate the scale of the page so it could be of desired width.
    if (width || height) {
      const viewport = page.getViewport({ scale: 1, rotation: rotate });
      pageScale = width ? width / viewport.width : height / viewport.height;
    }

    return scaleWithDefault * pageScale;
  }, [height, page, rotate, scaleProps, width]);

  function hook() {
    return () => {
      if (unregisterPage) {
        unregisterPage(pageIndex);
      }
    };
  }

  useEffect(hook, [pdf, pageIndex, unregisterPage]);

  /**
   * Called when a page is loaded successfully
   */
  function onLoadSuccess() {
    if (onLoadSuccessProps) {
      onLoadSuccessProps(makePageCallback(page, scale));
    }

    if (registerPage) {
      registerPage(pageIndex, pageElement.current);
    }
  }

  /**
   * Called when a page failed to load
   */
  function onLoadError() {
    warning(false, pageError);

    if (onLoadErrorProps) {
      onLoadErrorProps(pageError);
    }
  }

  function resetPage() {
    setPage(undefined);
    setPageError(undefined);
  }

  useEffect(resetPage, [pdf, pageIndex]);

  function loadPage() {
    if (!pageNumber) {
      return;
    }

    const cancellable = makeCancellable(pdf.getPage(pageNumber));
    const runningTask = cancellable;

    cancellable.promise.then(setPage).catch((error) => {
      setPage(false);
      setPageError(error);
    });

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadPage, [pdf, pageIndex, pageNumber, registerPage]);

  useEffect(
    () => {
      if (page === undefined) {
        return;
      }

      if (page === false) {
        onLoadError();
        return;
      }

      onLoadSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, scale],
  );

  const childContext = page
    ? {
        canvasBackground,
        customTextRenderer,
        devicePixelRatio,
        onGetAnnotationsError: onGetAnnotationsErrorProps,
        onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
        onGetTextError: onGetTextErrorProps,
        onGetTextSuccess: onGetTextSuccessProps,
        onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
        onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
        onRenderError: onRenderErrorProps,
        onRenderSuccess: onRenderSuccessProps,
        onRenderTextLayerError: onRenderTextLayerErrorProps,
        onRenderTextLayerSuccess: onRenderTextLayerSuccessProps,
        page,
        pageIndex,
        pageNumber,
        renderForms: renderForms ?? renderInteractiveForms, // For backward compatibility
        rotate: rotate,
        scale: scale,
      }
    : null;

  const eventProps = useMemo(
    () => makeEventProps(otherProps, () => (page ? makePageCallback(page, scale) : null)),
    [otherProps, page, scale],
  );

  const pageKey = `${pageIndex}@${scale}/${rotate}`;

  const pageKeyNoScale = `${pageIndex}/${rotate}`;

  function renderMainLayer() {
    switch (renderMode) {
      case 'none':
        return null;
      case 'svg':
        return <PageSVG key={`${pageKeyNoScale}_svg`} />;
      case 'canvas':
      default:
        return <PageCanvas key={`${pageKey}_canvas`} canvasRef={canvasRef} />;
    }
  }

  function renderTextLayer() {
    if (!renderTextLayerProps) {
      return null;
    }

    return <TextLayer key={`${pageKey}_text`} />;
  }

  function renderAnnotationLayer() {
    if (!renderAnnotationLayerProps) {
      return null;
    }

    /**
     * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
     * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
     */
    return <AnnotationLayer key={`${pageKey}_annotations`} />;
  }

  function renderChildren() {
    return (
      <PageContext.Provider value={childContext}>
        {renderMainLayer()}
        {renderTextLayer()}
        {renderAnnotationLayer()}
        {children}
      </PageContext.Provider>
    );
  }

  function renderContent() {
    if (!pageNumber) {
      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null || page === undefined || page === null) {
      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false || page === false) {
      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
    }

    return renderChildren();
  }

  return (
    <div
      className={clsx('react-pdf__Page', className)}
      data-page-number={pageNumber}
      ref={mergeRefs(inputRef, pageElement)}
      style={{
        position: 'relative',
        minWidth: 'min-content',
        minHeight: 'min-content',
      }}
      {...eventProps}
    >
      {renderContent()}
    </div>
  );
}

PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotationLayer: true,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: defaultScale,
};

const isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);

PageInternal.propTypes = {
  ...eventProps,
  canvasBackground: PropTypes.string,
  canvasRef: isRef,
  children: PropTypes.node,
  className: isClassName,
  customTextRenderer: PropTypes.func,
  devicePixelRatio: PropTypes.number,
  error: isFunctionOrNode,
  height: PropTypes.number,
  imageResourcesPath: PropTypes.string,
  inputRef: isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  onRenderTextLayerError: PropTypes.func,
  onRenderTextLayerSuccess: PropTypes.func,
  pageIndex: isPageIndex,
  pageNumber: isPageNumber,
  pdf: isPdf,
  registerPage: PropTypes.func,
  renderAnnotationLayer: PropTypes.bool,
  renderForms: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool, // For backward compatibility
  renderMode: isRenderMode,
  renderTextLayer: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
  unregisterPage: PropTypes.func,
  width: PropTypes.number,
};

function Page(props, ref) {
  return (
    <DocumentContext.Consumer>
      {(context) => <PageInternal ref={ref} {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}

export default React.forwardRef(Page);
