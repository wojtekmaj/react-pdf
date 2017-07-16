import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  isProvided,
  getPixelRatio,
} from './shared/util';

export default class Page extends Component {
  state = {
    page: null,
  }

  componentDidMount() {
    this.loadPage();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.pdf !== this.props.pdf ||
      this.getPageNumber(nextProps) !== this.getPageNumber()
    ) {
      this.loadPage(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.pdf !== this.state.pdf ||
      nextState.page !== this.state.page ||
      !Object.is(nextProps.rotate % 360, this.props.rotate % 360) || // Supports comparing NaN
      nextProps.width !== this.props.width ||
      nextProps.scale !== this.props.scale
    );
  }

  /**
   * Called when a page is read successfully
   */
  onLoadSuccess = (page) => {
    this.setState({ page });

    const { scale } = this;

    callIfDefined(
      this.props.onLoadSuccess,
      {
        ...page,
        // Legacy callback params
        get width() { return page.view[2] * scale; },
        get height() { return page.view[3] * scale; },
        scale,
        get originalWidth() { return page.view[2]; },
        get originalHeight() { return page.view[3]; },
      },
    );
  }

  /**
   * Called when a page failed to read successfully
   */
  onLoadError = (error) => {
    callIfDefined(
      this.props.onLoadError,
      error,
    );

    this.setState({ page: false });
  }

  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess = () => {
    this.renderer = null;

    callIfDefined(this.props.onRenderSuccess);
  }

  /**
   * Called when a page fails to load or render.
   */
  onRenderError = (error) => {
    callIfDefined(
      this.props.onRenderError,
      error,
    );

    this.setState({ page: false });
  }

  getPageIndex(props = this.props) {
    if (isProvided(props.pageIndex)) {
      return props.pageIndex;
    }

    if (isProvided(props.pageNumber)) {
      // @TODO: Page number isn't always the same
      return props.pageNumber - 1;
    }

    return null;
  }

  getPageNumber(props = this.props) {
    if (isProvided(props.pageNumber)) {
      return props.pageNumber;
    }

    if (isProvided(props.pageIndex)) {
      // @TODO: Page index isn't always the same
      return props.pageIndex + 1;
    }

    return null;
  }

  get pageIndex() {
    return this.getPageIndex();
  }

  get pageNumber() {
    // @TODO: Page numer isn't always the same
    return this.getPageNumber();
  }

  get rotate() {
    const { rotate } = this.props;

    if (isProvided(rotate)) {
      return rotate;
    }

    const { page } = this.state;

    return page.rotate;
  }

  get scale() {
    const { scale, width } = this.props;
    const { page } = this.state;
    const { rotate } = this;

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // If width is defined, calculate the scale of the page so it could be of desired width.
    if (width) {
      pageScale = width / page.getViewport(scale, rotate).width;
    }

    return scale * pageScale;
  }

  loadPage(props = this.props) {
    const { pdf } = props;
    const pageNumber = this.getPageNumber(props);

    if (!pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    if (this.state.page !== null) {
      this.setState({ page: null });
    }

    pdf.getPage(pageNumber)
      .then(this.onLoadSuccess)
      .catch(this.onLoadError);
  }

  drawPageOnCanvas = (canvas) => {
    if (!canvas) {
      return;
    }

    const { page } = this.state;
    const { rotate, scale } = this;

    const pixelRatio = getPixelRatio();
    const viewport = page.getViewport(scale * pixelRatio, rotate);

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
    canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;

    const canvasContext = canvas.getContext('2d');

    const renderContext = {
      canvasContext,
      viewport,
    };

    // If another render is in progress, let's cancel it
    /* eslint-disable no-underscore-dangle */
    if (this.renderer && this.renderer._internalRenderTask.running) {
      this.renderer._internalRenderTask.cancel();
    }
    /* eslint-enable no-underscore-dangle */

    this.renderer = page.render(renderContext);

    this.renderer
      .then(this.onRenderSuccess)
      .catch((dismiss) => {
        if (dismiss === 'cancelled') {
          // Everything's alright
          return;
        }

        this.onRenderError(dismiss);
      });
  }

  render() {
    const { pdf } = this.props;
    const { page } = this.state;
    const { pageIndex } = this;

    if (!pdf || !page) {
      return null;
    }

    if (pageIndex < 0 || pageIndex > pdf.numPages) {
      return null;
    }

    return (
      <div className="ReactPDF__Page">
        <canvas
          ref={(ref) => {
            if (!ref) return;

            this.drawPageOnCanvas(ref);
          }}
        />
      </div>
    );
  }
}

Page.defaultProps = {
  scale: 1.0,
};

Page.propTypes = {
  // @TODO: Check if > 0, < pdf.numPages
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: PropTypes.number,
  pageNumber: PropTypes.number,
  pdf: PropTypes.object,
  rotate: PropTypes.number,
  scale: PropTypes.number,
  width: PropTypes.number,
};
