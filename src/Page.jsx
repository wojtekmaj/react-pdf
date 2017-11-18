import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import PageCanvas from './PageCanvas';
import PageSVG from './PageSVG';
import PageTextContent from './PageTextContent';
import PageAnnotations from './PageAnnotations';

import {
  callIfDefined,
  errorOnDev,
  isProvided,
  makeCancellable,
} from './shared/util';
import { makeEventProps } from './shared/events';

import { eventsProps, linkServiceProp, pdfProp } from './shared/propTypes';

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
      callIfDefined(
        this.props.unregisterPage,
        this.state.page.pageIndex,
      );

      this.loadPage(nextProps);
    }
  }

  componentWillUnmount() {
    callIfDefined(
      this.props.unregisterPage,
      this.state.page.pageIndex,
    );

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

    callIfDefined(
      this.props.registerPage,
      page.pageIndex,
      this.ref,
    );
  }

  /**
   * Called when a page failed to load
   */
  onLoadError = (error) => {
    if ((error.message || error) === 'cancelled') {
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

  renderTextLayer() {
    const { renderTextLayer } = this.props;

    if (!renderTextLayer) {
      return null;
    }

    const {
      onGetTextError,
      onGetTextSuccess,
    } = this.props;
    const { page } = this.state;
    const { rotate, scale } = this;

    return (
      <PageTextContent
        key={`${page.pageIndex}@${scale}/${rotate}_text`}
        onGetTextError={onGetTextError}
        onGetTextSuccess={onGetTextSuccess}
        page={page}
        rotate={rotate}
        scale={scale}
      />
    );
  }

  renderAnnotations() {
    const { renderAnnotations } = this.props;

    if (!renderAnnotations) {
      return null;
    }

    const { linkService } = this.props;
    const { page } = this.state;
    const { rotate, scale } = this;

    return (
      <PageAnnotations
        key={`${page.pageIndex}@${scale}/${rotate}_annotations`}
        linkService={linkService}
        page={page}
        rotate={rotate}
        scale={scale}
      />
    );
  }

  renderSVG() {
    const {
      onRenderError,
      onRenderSuccess,
    } = this.props;
    const { page } = this.state;
    const { rotate, scale } = this;

    return [
      <PageSVG
        key={`${page.pageIndex}@${scale}/${rotate}_svg`}
        onRenderError={onRenderError}
        onRenderSuccess={onRenderSuccess}
        page={page}
        rotate={this.rotate}
        scale={this.scale}
      />,
      /**
       * As of now, PDF.js 2.0.120 returns warnings on unimplemented annotations.
       * Therefore, as a fallback, we render "traditional" PageAnnotations component.
       */
      this.renderAnnotations(),
    ];
  }

  renderCanvas() {
    const {
      onRenderError,
      onRenderSuccess,
    } = this.props;
    const { page } = this.state;
    const { rotate, scale } = this;

    return [
      <PageCanvas
        key={`${page.pageIndex}@${scale}/${rotate}_canvas`}
        onRenderError={onRenderError}
        onRenderSuccess={onRenderSuccess}
        page={page}
        rotate={rotate}
        scale={scale}
      />,
      this.renderTextLayer(),
      this.renderAnnotations(),
    ];
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
      renderMode,
    } = this.props;

    return (
      <div
        className={mergeClassNames('ReactPDF__Page', className)}
        ref={(ref) => {
          const { inputRef } = this.props;
          if (inputRef) {
            inputRef(ref);
          }

          this.ref = ref;
        }}
        style={{ position: 'relative' }}
        data-page-number={this.getPageNumber()}
        {...this.eventProps}
      >
        {
          renderMode === 'svg' ?
            this.renderSVG() :
            this.renderCanvas()
        }
        {children}
      </div>
    );
  }
}

Page.defaultProps = {
  renderAnnotations: true,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: 1.0,
};

Page.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  inputRef: PropTypes.func,
  linkService: linkServiceProp,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
  pageNumber: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
  pdf: pdfProp,
  registerPage: PropTypes.func,
  renderAnnotations: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  rotate: PropTypes.number,
  scale: PropTypes.number,
  unregisterPage: PropTypes.func,
  width: PropTypes.number,
  ...eventsProps(),
};
