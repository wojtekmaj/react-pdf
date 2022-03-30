import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeRefs from 'merge-refs';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import PageContext from '../PageContext';

import { getPixelRatio, isCancelException, makePageCallback } from '../shared/utils';

import { isPage, isRef, isRotate } from '../shared/propTypes';

const ANNOTATION_MODE = pdfjs.AnnotationMode;

export class PageCanvasInternal extends PureComponent {
  canvasElement = createRef();

  componentDidMount() {
    this.drawPageOnCanvas();
  }

  componentDidUpdate(prevProps) {
    const { canvasBackground, page, renderForms } = this.props;
    if (canvasBackground !== prevProps.canvasBackground || renderForms !== prevProps.renderForms) {
      // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
      page.cleanup();
      this.drawPageOnCanvas();
    }
  }

  componentWillUnmount() {
    this.cancelRenderingTask();

    const { current: canvas } = this.canvasElement;

    /**
     * Zeroing the width and height cause most browsers to release graphics
     * resources immediately, which can greatly reduce memory consumption.
     */
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  cancelRenderingTask() {
    if (this.renderer) {
      this.renderer.cancel();
      this.renderer = null;
    }
  }

  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess = () => {
    this.renderer = null;

    const { onRenderSuccess, page, scale } = this.props;

    if (onRenderSuccess) onRenderSuccess(makePageCallback(page, scale));
  };

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if (isCancelException(error)) {
      return;
    }

    warning(error);

    const { onRenderError } = this.props;

    if (onRenderError) onRenderError(error);
  };

  get renderViewport() {
    const { page, rotate, scale } = this.props;

    const pixelRatio = getPixelRatio();

    return page.getViewport({ scale: scale * pixelRatio, rotation: rotate });
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport({ scale, rotation: rotate });
  }

  drawPageOnCanvas = () => {
    const { current: canvas } = this.canvasElement;

    if (!canvas) {
      return null;
    }

    const { renderViewport, viewport } = this;
    const { canvasBackground, page, renderForms } = this.props;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      annotationMode: renderForms ? ANNOTATION_MODE.ENABLE_FORMS : ANNOTATION_MODE.ENABLE,
      get canvasContext() {
        return canvas.getContext('2d');
      },
      viewport: renderViewport,
    };
    if (canvasBackground) {
      renderContext.background = canvasBackground;
    }

    // If another render is in progress, let's cancel it
    this.cancelRenderingTask();

    this.renderer = page.render(renderContext);

    return this.renderer.promise.then(this.onRenderSuccess).catch(this.onRenderError);
  };

  render() {
    const { canvasRef } = this.props;

    return (
      <canvas
        className="react-pdf__Page__canvas"
        dir="ltr"
        ref={mergeRefs(canvasRef, this.canvasElement)}
        style={{
          display: 'block',
          userSelect: 'none',
        }}
      />
    );
  }
}

PageCanvasInternal.propTypes = {
  canvasBackground: PropTypes.string,
  canvasRef: isRef,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  renderForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number.isRequired,
};

export default function PageCanvas(props) {
  return (
    <PageContext.Consumer>
      {(context) => <PageCanvasInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
