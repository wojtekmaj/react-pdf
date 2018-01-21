import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import PageCanvas from './PageCanvas';
import PageSVG from './PageSVG';
import PageTextContent from './PageTextContent';
import PageAnnotations from './PageAnnotations';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  isProvided,
  makeCancellable,
} from './shared/utils';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName, isLinkService, isPageIndex, isPageNumber, isPdf } from './shared/propTypes';

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
        this.pageIndex,
      );

      if (this.state.page !== null) {
        this.setState({ page: null });
      }

      this.loadPage(nextProps);
    }
  }

  componentWillUnmount() {
    callIfDefined(
      this.props.unregisterPage,
      this.pageIndex,
    );

    cancelRunningTask(this.runningTask);
  }

  /**
   * Called when a page is loaded successfully
   */
  onLoadSuccess = (page) => {
    this.setState({ page }, () => {
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
    });
  }

  /**
   * Called when a page failed to load
   */
  onLoadError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
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
    if (isProvided(props.pageNumber)) {
      return props.pageNumber - 1;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex;
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

  getPageCallback = () => {
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
    return this.getPageCallback();
  }

  get eventProps() {
    return makeEventProps(this.props, this.getPageCallback);
  }

  get pageKey() {
    return `${this.state.page.pageIndex}@${this.scale}/${this.rotate}`;
  }

  get pageProps() {
    return {
      page: this.state.page,
      rotate: this.rotate,
      scale: this.scale,
    };
  }

  loadPage(props = this.props) {
    const { pdf } = props;

    if (!pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    const pageNumber = this.getPageNumber(props);

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

    return (
      <PageTextContent
        key={`${this.pageKey}_text`}
        onGetTextError={onGetTextError}
        onGetTextSuccess={onGetTextSuccess}
        {...this.pageProps}
      />
    );
  }

  renderAnnotations() {
    const { renderAnnotations } = this.props;

    if (!renderAnnotations) {
      return null;
    }

    const { linkService } = this.props;

    return (
      <PageAnnotations
        key={`${this.pageKey}_annotations`}
        linkService={linkService}
        {...this.pageProps}
      />
    );
  }

  renderSVG() {
    const {
      onRenderError,
      onRenderSuccess,
    } = this.props;

    return [
      <PageSVG
        key={`${this.pageKey}_svg`}
        onRenderError={onRenderError}
        onRenderSuccess={onRenderSuccess}
        {...this.pageProps}
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

    return [
      <PageCanvas
        key={`${this.pageKey}_canvas`}
        onRenderError={onRenderError}
        onRenderSuccess={onRenderSuccess}
        {...this.pageProps}
      />,
      this.renderTextLayer(),
      this.renderAnnotations(),
    ];
  }

  renderError() {
    return (
      <div className="react-pdf__message react-pdf__message--error">{this.props.error}</div>
    );
  }

  renderLoader() {
    return (
      <div className="react-pdf__message react-pdf__message--loading">{this.props.loading}</div>
    );
  }

  renderChildren() {
    const {
      children,
      renderMode,
    } = this.props;

    return [
      (
        renderMode === 'svg' ?
          this.renderSVG() :
          this.renderCanvas()
      ),
      children,
    ];
  }

  render() {
    const { className, pdf } = this.props;
    const { page } = this.state;

    let content;
    if (pdf === null || page === null) {
      content = this.renderLoader();
    } else if (pdf === false || page === false) {
      content = this.renderError();
    } else {
      content = this.renderChildren();
    }

    return (
      <div
        className={mergeClassNames('react-pdf__Page', className)}
        ref={(ref) => {
          const { inputRef } = this.props;
          if (inputRef) {
            inputRef(ref);
          }

          this.ref = ref;
        }}
        style={{ position: 'relative' }}
        data-page-number={this.pageNumber}
        {...this.eventProps}
      >
        {content}
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
  className: isClassName,
  inputRef: PropTypes.func,
  linkService: isLinkService,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: isPageIndex,
  pageNumber: isPageNumber,
  pdf: isPdf,
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
