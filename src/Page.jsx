import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import PageCanvas from './PageCanvas';
import PageTextContent from './PageTextContent';

import {
  callIfDefined,
  errorOnDev,
  isProvided,
  makeCancellable,
} from './shared/util';
import { makeEventProps } from './shared/events';

import { eventsProps } from './shared/propTypes';

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

    const { pageCallback } = this;

    callIfDefined(
      this.props.onLoadSuccess,
      pageCallback,
    );
  }

  /**
   * Called when a page failed to load
   */
  onLoadError = (error) => {
    if (error === 'cancelled') {
      return;
    }

    errorOnDev(error.message, error);

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

  get pageCallback() {
    const { page } = this.state;
    const { scale } = this;

    return {
      ...page,
      // Legacy callback params
      get width() { return page.view[2] * scale; },
      get height() { return page.view[3] * scale; },
      scale,
      get originalWidth() { return page.view[2]; },
      get originalHeight() { return page.view[3]; },
    };
  }

  get eventProps() {
    return makeEventProps(this.props, this.pageCallback);
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
    const { pdf } = this.props;
    const { page } = this.state;
    const { pageIndex } = this;

    if (!pdf || !page) {
      return null;
    }

    if (pageIndex < 0 || pageIndex > pdf.numPages) {
      return null;
    }

    const {
      children,
      className,
      onGetTextError,
      onGetTextSuccess,
      onRenderError,
      onRenderSuccess,
      renderTextLayer,
    } = this.props;
    const { rotate, scale } = this;

    return (
      <div
        className={mergeClassNames('ReactPDF__Page', className)}
        style={{ position: 'relative' }}
        {...this.eventProps}
      >
        <PageCanvas
          key={`${page.pageIndex}@${scale}/${rotate}_canvas`}
          onRenderError={onRenderError}
          onRenderSuccess={onRenderSuccess}
          page={page}
          rotate={rotate}
          scale={scale}
        />
        {
          renderTextLayer &&
            <PageTextContent
              key={`${page.pageIndex}@${rotate}_text`}
              onGetTextError={onGetTextError}
              onGetTextSuccess={onGetTextSuccess}
              page={page}
              rotate={rotate}
              scale={scale}
            />
        }
        {children}
      </div>
    );
  }
}

Page.defaultProps = {
  renderTextLayer: true,
  scale: 1.0,
};

Page.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
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
  ...eventsProps(),
};
