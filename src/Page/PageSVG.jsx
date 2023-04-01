import React, { useContext, useEffect, useMemo, useState } from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import pdfjs from 'pdfjs-dist';

import PageContext from '../PageContext';

import { cancelRunningTask, isCancelException, makePageCallback } from '../shared/utils';

export default function PageSVG() {
  const context = useContext(PageContext);

  invariant(context, 'Unable to find Page context.');

  const {
    onRenderSuccess: onRenderSuccessProps,
    onRenderError: onRenderErrorProps,
    page,
    rotate,
    scale,
  } = context;

  const [svg, setSvg] = useState(undefined);
  const [svgError, setSvgError] = useState(undefined);

  invariant(page, 'Attempted to render page SVG, but no page was specified.');

  /**
   * Called when a page is rendered successfully
   */
  function onRenderSuccess() {
    if (onRenderSuccessProps) {
      onRenderSuccessProps(makePageCallback(page, scale));
    }
  }

  /**
   * Called when a page fails to render
   */
  function onRenderError() {
    if (isCancelException(svgError)) {
      return;
    }

    warning(false, svgError);

    if (onRenderErrorProps) {
      onRenderErrorProps(svgError);
    }
  }

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale],
  );

  function resetSVG() {
    setSvg(undefined);
    setSvgError(undefined);
  }

  useEffect(resetSVG, [page, viewport]);

  function renderSVG() {
    const cancellable = makeCancellable(page.getOperatorList());

    cancellable.promise
      .then((operatorList) => {
        const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);

        svgGfx
          .getSVG(operatorList, viewport)
          .then(setSvg)
          .catch((error) => {
            setSvg(false);
            setSvgError(error);
          });
      })
      .catch((error) => {
        setSvg(false);
        setSvgError(error);
      });

    return () => cancelRunningTask(cancellable);
  }

  useEffect(renderSVG, [page, viewport]);

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

  function drawPageOnContainer(element) {
    if (!element || !svg) {
      return;
    }

    // Append SVG element to the main container, if this hasn't been done already
    if (!element.firstElementChild) {
      element.appendChild(svg);
    }

    const { width, height } = viewport;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  const { width, height } = viewport;

  return (
    <div
      className="react-pdf__Page__svg"
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
