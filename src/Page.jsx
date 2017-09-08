import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PageCanvas from './PageCanvas';
import PageTextContent from './PageTextContent';

import {
  callIfDefined,
  isProvided,
  makeCancellable,
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

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  /**
   * Called when a page is loaded successfully
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
   * Called when a page failed to load
   */
  onLoadError = (error) => {
    if (error === 'cancelled') {
      return;
    }

    callIfDefined(
      this.props.onLoadError,
      error,
    );

    this.setState({ page: false });
  }

  getPageIndex(props = this.props) {
    if (isProvided(props.pageIndex)) {
      return props.pageIndex;
    }

    if (isProvided(props.pageNumber)) {
      return props.pageNumber - 1;
    }

    return null;
  }

  getPageNumber(props = this.props) {
    if (isProvided(props.pageNumber)) {
      return props.pageNumber;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex + 1;
    }

    return null;
  }

  get pageIndex() {
    return this.getPageIndex();
  }

  get pageNumber() {
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
      const viewport = page.getViewport(scale, rotate);
      pageScale = width / viewport.width;
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

    this.runningTask = makeCancellable(pdf.getPage(pageNumber));

    return this.runningTask.promise
      .then(this.onLoadSuccess)
      .catch(this.onLoadError);
  }

  render() {
    const {
      onGetTextError,
      onGetTextSuccess,
      onRenderError,
      onRenderSuccess,
      renderTextLayer,
      className,
      pdf,
      scale,  // consume all props for ...other
      width,  // consume all props for ...other
      rotate, // consume all props for ...other
      onLoadError,  // consume all props for ...other
      onLoadSuccess,// consume all props for ...other
      pageNumber,   // consume all props for ...other
      ...other
     } = this.props;

    const { page } = this.state;
    const { pageIndex } = this;

    if (!pdf || !page) {
      return null;
    }

    if (pageIndex < 0 || pageIndex > pdf.numPages) {
      return null;
    }

    return (
      <div
        {...other}
        className={`ReactPDF__Page ${className}`}
        style={{ position: 'relative' }}
      >
        <PageCanvas
          onRenderError={onRenderError}
          onRenderSuccess={onRenderSuccess}
          page={page}
          rotate={this.rotate}
          scale={this.scale}
        />
        {
          renderTextLayer &&
            <PageTextContent
              onGetTextError={onGetTextError}
              onGetTextSuccess={onGetTextSuccess}
              page={page}
              rotate={this.rotate}
              scale={this.scale}
            />
        }
      </div>
    );
  }
}

Page.defaultProps = {
  renderTextLayer: true,
  scale: 1.0,
};

Page.propTypes = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
  pageNumber: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
  pdf: PropTypes.shape({
    getPage: PropTypes.func.isRequired,
    numPages: PropTypes.number.isRequired,
  }),
  renderTextLayer: PropTypes.bool,
  rotate: PropTypes.number,
  scale: PropTypes.number,
  width: PropTypes.number,
  className: PropTypes.string,
};
