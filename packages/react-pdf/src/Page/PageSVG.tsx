import React, { useEffect, useMemo } from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import pdfjs from '../pdfjs.js';

import usePageContext from '../shared/hooks/usePageContext.js';
import useResolver from '../shared/hooks/useResolver.js';
import { cancelRunningTask, isCancelException, makePageCallback } from '../shared/utils.js';

export default function PageSVG() {
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const {
    _className,
    onRenderSuccess: onRenderSuccessProps,
    onRenderError: onRenderErrorProps,
    page,
    rotate,
    scale,
  } = pageContext;

  invariant(page, 'Attempted to render page SVG, but no page was specified.');

  const [svgState, svgDispatch] = useResolver<SVGElement>();
  const { value: svg, error: svgError } = svgState;

  /**
   * Called when a page is rendered successfully
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
   * Called when a page fails to render
   */
  function onRenderError() {
    if (!svgError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    if (isCancelException(svgError)) {
      return;
    }

    warning(false, svgError.toString());

    if (onRenderErrorProps) {
      onRenderErrorProps(svgError);
    }
  }

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale],
  );

  function resetSVG() {
    svgDispatch({ type: 'RESET' });
  }

  useEffect(resetSVG, [page, svgDispatch, viewport]);

  function renderSVG() {
    if (!page) {
      return;
    }

    const cancellable = makeCancellable(page.getOperatorList());

    cancellable.promise
      .then((operatorList) => {
        const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);

        svgGfx
          .getSVG(operatorList, viewport)
          .then((nextSvg: unknown) => {
            // See https://github.com/mozilla/pdf.js/issues/16745
            if (!(nextSvg instanceof SVGElement)) {
              throw new Error('getSVG returned unexpected result.');
            }

            svgDispatch({ type: 'RESOLVE', value: nextSvg });
          })
          .catch((error) => {
            svgDispatch({ type: 'REJECT', error });
          });
      })
      .catch((error) => {
        svgDispatch({ type: 'REJECT', error });
      });

    return () => cancelRunningTask(cancellable);
  }

  useEffect(renderSVG, [page, svgDispatch, viewport]);

  useEffect(
    () => {
      if (svg === undefined) {
        return;
      }

      if (svg === false) {
        onRenderError();
        return;
      }

      onRenderSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [svg],
  );

  function drawPageOnContainer(element: HTMLDivElement | null) {
    if (!element || !svg) {
      return;
    }

    // Append SVG element to the main container, if this hasn't been done already
    if (!element.firstElementChild) {
      element.appendChild(svg);
    }

    const { width, height } = viewport;

    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);
  }

  const { width, height } = viewport;

  return (
    <div
      className={`${_className}__svg`}
      // Note: This cannot be shortened, as we need this function to be called with each render.
      ref={(ref) => drawPageOnContainer(ref)}
      style={{
        display: 'block',
        backgroundColor: 'white',
        overflow: 'hidden',
        width,
        height,
        userSelect: 'none',
      }}
    />
  );
}
