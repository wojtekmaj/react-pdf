import { useEffect, useMemo, useRef } from 'react';
import invariant from 'tiny-invariant';
import { usePageContext } from 'react-pdf';

import type { RenderParameters } from 'pdfjs-dist/types/src/display/api.js';

export default function CustomRenderer() {
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const { _className, page, rotate, scale } = pageContext;

  invariant(page, 'Attempted to render page canvas, but no page was specified.');

  const canvasElement = useRef<HTMLCanvasElement>(null);

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale],
  );

  function drawPageOnCanvas() {
    if (!page) {
      return;
    }

    const { current: canvas } = canvasElement;

    if (!canvas) {
      return;
    }

    const renderContext: RenderParameters = {
      canvasContext: canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D,
      viewport,
    };

    const cancellable = page.render(renderContext);
    const runningTask = cancellable;

    cancellable.promise.catch(() => {
      // Intentionally empty
    });

    return () => {
      runningTask.cancel();
    };
  }

  useEffect(drawPageOnCanvas, [canvasElement, page, viewport]);

  return (
    <canvas
      className={`${_className}__canvas`}
      height={viewport.height}
      ref={canvasElement}
      width={viewport.width}
    />
  );
}
