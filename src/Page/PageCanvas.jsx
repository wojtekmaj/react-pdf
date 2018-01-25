import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  errorOnDev,
  getPixelRatio,
  makePageCallback,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export default class PageCanvas extends Component {
  componentWillUnmount() {
    /* eslint-disable no-underscore-dangle */
    if (this.renderer && this.renderer._internalRenderTask.running) {
      this.renderer._internalRenderTask.cancel();
    }
    /* eslint-enable no-underscore-dangle */
  }

  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess = () => {
    this.renderer = null;

    const { page, scale } = this.context;

    callIfDefined(
      this.context.onRenderSuccess,
      makePageCallback(page, scale),
    );
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error.message, error);

    callIfDefined(
      this.context.onRenderError,
      error,
    );
  }

  get renderViewport() {
    const { page, rotate, scale } = this.context;

    const pixelRatio = getPixelRatio();

    return page.getViewport(scale * pixelRatio, rotate);
  }

  get viewport() {
    const { page, rotate, scale } = this.context;

    return page.getViewport(scale, rotate);
  }

  drawPageOnCanvas = (canvas) => {
    if (!canvas) {
      return null;
    }

    const { page } = this.context;

    const { renderViewport, viewport } = this;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      get canvasContext() {
        return canvas.getContext('2d');
      },
      viewport: renderViewport,
    };

    // If another render is in progress, let's cancel it
    /* eslint-disable no-underscore-dangle */
    if (this.renderer && this.renderer._internalRenderTask.running) {
      this.renderer._internalRenderTask.cancel();
    }
    /* eslint-enable no-underscore-dangle */

    this.renderer = page.render(renderContext);

    return this.renderer
      .then(this.onRenderSuccess)
      .catch(this.onRenderError);
  }

  render() {
    return (
      <canvas
        className="react-pdf__Page__canvas"
        style={{
          display: 'block',
          userSelect: 'none',
        }}
        ref={this.drawPageOnCanvas}
      />
    );
  }
}

PageCanvas.contextTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};
