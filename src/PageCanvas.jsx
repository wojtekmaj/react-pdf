import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  errorOnDev,
  getPixelRatio,
} from './shared/util';

import { pageProp, rotateProp } from './shared/propTypes';

export default class PageCanvas extends Component {
  componentDidMount() {
    this.drawPageOnCanvas();
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;

    if (nextProps.renderInteractiveForms !== props.renderInteractiveForms) {
      nextProps.page.cleanup();
    }

    if (
      nextProps.page !== props.page ||
      nextProps.renderInteractiveForms !== props.renderInteractiveForms
    ) {
      this.drawPageOnCanvas(nextProps);
    }
  }

  componentWillUnmount() {
    this.cancelRenderingTask();
  }

  cancelRenderingTask() {
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

    callIfDefined(this.props.onRenderSuccess);
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if ((error.message || error) === 'cancelled') {
      return;
    }

    errorOnDev(error.message, error);

    callIfDefined(
      this.props.onRenderError,
      error,
    );
  }

  get renderViewport() {
    const { page, rotate, scale } = this.props;

    const pixelRatio = getPixelRatio();

    return page.getViewport(scale * pixelRatio, rotate);
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport(scale, rotate);
  }

  drawPageOnCanvas = (props = this.props) => {
    const { canvasLayer: canvas } = this;

    if (!canvas) {
      return null;
    }

    const { page, renderInteractiveForms } = props;

    const { renderViewport, viewport } = this;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const canvasContext = canvas.getContext('2d');

    const renderContext = {
      canvasContext,
      viewport: renderViewport,
      renderInteractiveForms,
    };

    // If another render is in progress, let's cancel it
    this.cancelRenderingTask();

    this.renderer = page.render(renderContext);

    return this.renderer
      .then(this.onRenderSuccess)
      .catch(this.onRenderError);
  }

  render() {
    return (
      <canvas
        className="ReactPDF__Page__canvas"
        style={{
          display: 'block',
          userSelect: 'none',
        }}
        ref={(ref) => { this.canvasLayer = ref; }}
      />
    );
  }
}

PageCanvas.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: pageProp.isRequired,
  renderInteractiveForms: PropTypes.bool,
  rotate: rotateProp,
  scale: PropTypes.number,
};
