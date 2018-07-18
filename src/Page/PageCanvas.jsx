import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PageContext from '../PageContext';

import {
  callIfDefined,
  errorOnDev,
  getPixelRatio,
  isCancelException,
  makePageCallback,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export class PageCanvasInternal extends PureComponent {
  componentDidMount() {
    this.drawPageOnCanvas();
  }

  componentDidUpdate(prevProps) {
    const { page, renderInteractiveForms } = this.props;
    if (renderInteractiveForms !== prevProps.renderInteractiveForms) {
      // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
      page.cleanup();
      this.drawPageOnCanvas();
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

    const { onRenderSuccess, page, scale } = this.props;

    callIfDefined(
      onRenderSuccess,
      makePageCallback(page, scale),
    );
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if (isCancelException(error)) {
      return;
    }

    errorOnDev(error);

    const { onRenderError } = this.props;

    callIfDefined(
      onRenderError,
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

  drawPageOnCanvas = () => {
    const { canvasLayer: canvas } = this;

    if (!canvas) {
      return null;
    }

    const { renderViewport, viewport } = this;
    const { page, renderInteractiveForms } = this.props;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      get canvasContext() {
        return canvas.getContext('2d');
      },
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
        className="react-pdf__Page__canvas"
        style={{
          display: 'block',
          userSelect: 'none',
        }}
        ref={(ref) => { this.canvasLayer = ref; }}
      />
    );
  }
}

PageCanvasInternal.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
};

const PageCanvas = props => (
  <PageContext.Consumer>
    {context => <PageCanvasInternal {...context} {...props} />}
  </PageContext.Consumer>
);

export default PageCanvas;
