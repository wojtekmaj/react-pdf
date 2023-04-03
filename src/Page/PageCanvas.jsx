import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import mergeRefs from 'merge-refs';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import pdfjs from 'pdfjs-dist';

import PageContext from '../PageContext';

import {
  cancelRunningTask,
  getDevicePixelRatio,
  isCancelException,
  makePageCallback,
} from '../shared/utils';

import { isRef } from '../shared/propTypes';

const ANNOTATION_MODE = pdfjs.AnnotationMode;

export default function PageCanvas({ canvasRef, ...props }) {
  const context = useContext(PageContext);

  invariant(context, 'Unable to find Page context.');

  const mergedProps = { ...context, ...props };
  const {
    canvasBackground,
    devicePixelRatio: devicePixelRatioProps,
    onRenderError: onRenderErrorProps,
    onRenderSuccess: onRenderSuccessProps,
    page,
    renderForms,
    rotate,
    scale,
  } = mergedProps;

  const canvasElement = useRef();

  invariant(page, 'Attempted to render page canvas, but no page was specified.');

  const devicePixelRatio = devicePixelRatioProps || getDevicePixelRatio();

  /**
   * Called when a page is rendered successfully.
   */
  function onRenderSuccess() {
    if (onRenderSuccessProps) {
      onRenderSuccessProps(makePageCallback(page, scale));
    }
  }

  /**
   * Called when a page fails to render.
   */
  function onRenderError(error) {
    if (isCancelException(error)) {
      return;
    }

    warning(false, error);

    if (onRenderErrorProps) {
      onRenderErrorProps(error);
    }
  }

  const renderViewport = useMemo(
    () => page.getViewport({ scale: scale * devicePixelRatio, rotation: rotate }),
    [devicePixelRatio, page, rotate, scale],
  );

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale],
  );

  function drawPageOnCanvas() {
    // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
    page.cleanup();

    const { current: canvas } = canvasElement;

    if (!canvas) {
      return null;
    }

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      annotationMode: renderForms ? ANNOTATION_MODE.ENABLE_FORMS : ANNOTATION_MODE.ENABLE,
      get canvasContext() {
        return canvas.getContext('2d', { alpha: false });
      },
      viewport: renderViewport,
    };
    if (canvasBackground) {
      renderContext.background = canvasBackground;
    }

    const cancellable = page.render(renderContext);
    const runningTask = cancellable;

    cancellable.promise.then(onRenderSuccess).catch(onRenderError);

    return () => cancelRunningTask(runningTask);
  }

  useEffect(
    drawPageOnCanvas,
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canvasBackground,
      canvasElement,
      devicePixelRatio,
      page,
      renderForms,
      renderViewport,
      viewport,
    ],
  );

  const cleanup = useCallback(() => {
    const { current: canvas } = canvasElement;

    /**
     * Zeroing the width and height cause most browsers to release graphics
     * resources immediately, which can greatly reduce memory consumption.
     */
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }, [canvasElement]);

  useEffect(() => cleanup, [cleanup]);

  return (
    <canvas
      className="react-pdf__Page__canvas"
      dir="ltr"
      ref={mergeRefs(canvasRef, canvasElement)}
      style={{
        display: 'block',
        userSelect: 'none',
      }}
    />
  );
}

PageCanvas.propTypes = {
  canvasRef: isRef,
};
