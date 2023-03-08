import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

import PageContext from '../PageContext';

import { cancelRunningTask, isCancelException, makePageCallback } from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export function PageSVGInternal({
  onRenderSuccess: onRenderSuccessProps,
  onRenderError: onRenderErrorProps,
  page,
  rotate: rotateProps,
  scale,
}) {
  const [svg, setSvg] = useState(null);

  /**
   * Called when a page is rendered successfully
   */
  const onRenderSuccess = useCallback(() => {
    if (onRenderSuccessProps) {
      onRenderSuccessProps(makePageCallback(page, scale));
    }
  }, [onRenderSuccessProps, page, scale]);

  /**
   * Called when a page fails to render
   */
  const onRenderError = useCallback(
    (error) => {
      if (isCancelException(error)) {
        return;
      }

      warning(false, error);

      if (onRenderErrorProps) {
        onRenderErrorProps(error);
      }
    },
    [onRenderErrorProps],
  );

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotateProps }),
    [page, rotateProps, scale],
  );

  function renderSVG() {
    if (svg) {
      return;
    }

    const cancellable = makeCancellable(page.getOperatorList());
    const runningTask = cancellable.promise;

    cancellable.promise
      .then((operatorList) => {
        const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
        svgGfx
          .getSVG(operatorList, viewport)
          .then((nextSvg) => {
            setSvg(nextSvg);

            // Waiting for svg to be set in state
            setTimeout(() => {
              onRenderSuccess();
            }, 0);
          })
          .catch(onRenderError);
      })
      .catch(onRenderError);

    return () => cancelRunningTask(runningTask);
  }

  useEffect(renderSVG, [onRenderError, onRenderSuccess, page, svg, viewport]);

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

PageSVGInternal.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number.isRequired,
};

export default function PageSVG(props) {
  return (
    <PageContext.Consumer>
      {(context) => <PageSVGInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
