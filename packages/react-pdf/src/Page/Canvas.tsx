'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mergeRefs from 'merge-refs';
import * as pdfjs from 'pdfjs-dist';
import invariant from 'tiny-invariant';
import warning from 'warning';

import StructTree from '../StructTree.js';

import usePageContext from '../shared/hooks/usePageContext.js';

import {
  cancelRunningTask,
  getDevicePixelRatio,
  isCancelException,
  isProvided,
  makePageCallback,
} from '../shared/utils.js';

import type { RenderParameters } from 'pdfjs-dist/types/src/display/api.js';

const ANNOTATION_MODE = pdfjs.AnnotationMode;

type CanvasProps = {
  canvasRef?: React.Ref<HTMLCanvasElement>;
};

export default function Canvas(props: CanvasProps): React.ReactElement {
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const mergedProps = { ...pageContext, ...props };
  const {
    _className,
    canvasBackground,
    devicePixelRatio = getDevicePixelRatio(),
    onRenderError: onRenderErrorProps,
    onRenderSuccess: onRenderSuccessProps,
    optionalContentService,
    page,
    renderForms,
    renderTextLayer,
    rotate,
    scale,
  } = mergedProps;
  const { canvasRef } = props;

  invariant(page, 'Attempted to render page canvas, but no page was specified.');

  const canvasElement = useRef<HTMLCanvasElement>(null);

  const [optionalContentConfigLastUpdate, setOptionalContentConfigLastUpdate] = useState<Date>(
    new Date(),
  );

  const onLayerVisibilityChange = useCallback((): void => {
    if (!optionalContentService) {
      return;
    }

    setOptionalContentConfigLastUpdate(new Date());
  }, [optionalContentService]);

  useEffect(() => {
    if (!optionalContentService) {
      return;
    }

    optionalContentService.addVisibilityChangeListener(onLayerVisibilityChange);

    return () => {
      optionalContentService.removeVisibilityChangeListener(onLayerVisibilityChange);
    };
  }, [optionalContentService, onLayerVisibilityChange]);

  /**
   * Called when a page is rendered successfully.
   */
  function onRenderSuccess() {
    if (!page) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    if (onRenderSuccessProps) {
      onRenderSuccessProps(makePageCallback(page, scale));
    }
  }

  /**
   * Called when a page fails to render.
   */
  function onRenderError(error: Error) {
    if (isCancelException(error)) {
      return;
    }

    warning(false, error.toString());

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(
    function drawPageOnCanvas() {
      if (!page) {
        return;
      }

      // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
      page.cleanup();

      const { current: canvas } = canvasElement;

      if (!canvas) {
        return;
      }

      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;

      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.style.visibility = 'hidden';

      const renderContext: RenderParameters = {
        annotationMode: renderForms ? ANNOTATION_MODE.ENABLE_FORMS : ANNOTATION_MODE.ENABLE,
        canvas,
        canvasContext: canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D,
        viewport: renderViewport,
        optionalContentConfigPromise: isProvided(optionalContentService)
          ? Promise.resolve(optionalContentService.getOptionalContentConfig())
          : undefined,
      };
      if (canvasBackground) {
        renderContext.background = canvasBackground;
      }

      const cancellable = page.render(renderContext);
      const runningTask = cancellable;

      cancellable.promise
        .then(() => {
          canvas.style.visibility = '';

          onRenderSuccess();
        })
        .catch(onRenderError);

      return () => cancelRunningTask(runningTask);
    },
    [
      canvasBackground,
      optionalContentConfigLastUpdate,
      optionalContentService,
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
  }, []);

  useEffect(() => cleanup, [cleanup]);

  return (
    <canvas
      className={`${_className}__canvas`}
      dir="ltr"
      ref={mergeRefs(canvasRef, canvasElement)}
      style={{
        display: 'block',
        userSelect: 'none',
      }}
    >
      {renderTextLayer ? <StructTree /> : null}
    </canvas>
  );
}
