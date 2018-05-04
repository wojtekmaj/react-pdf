import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PageContext from '../PageContext';

import {
  callIfDefined,
  errorOnDev,
  getPixelRatio,
  makePageCallback,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export class PageCanvasInternal extends PureComponent {
  componentDidMount() {
    this.drawPageOnCanvas();
  }

  componentDidUpdate(prevProps) {
    if (this.props.renderInteractiveForms !== prevProps.renderInteractiveForms) {
      // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
      this.props.page.cleanup();
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

    const { page, scale } = this.props;

    callIfDefined(
      this.props.onRenderSuccess,
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

    errorOnDev(error);

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

  drawPageOnCanvas = () => {
    const { canvasLayer: canvas } = this;

    if (!canvas) {
      return null;
    }

    const { renderViewport, viewport } = this;
    const { page, renderInteractiveForms } = this.props;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    // Avoid overwriting any user passed styles with computed values
    if (!this.props.style.width) {
      canvas.style.width = `${Math.floor(viewport.width)}px`;
    }
    if (!this.props.style.height) {
      canvas.style.height = `${Math.floor(viewport.height)}px`;
    }

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
          ...this.props.style,
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
  style: PropTypes.objectOf(PropTypes.string),
};

const PageCanvas = props => (
  <PageContext.Consumer>
    {context => <PageCanvasInternal {...context} {...props} />}
  </PageContext.Consumer>
);

export default PageCanvas;
