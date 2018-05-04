import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  isProvided,
  makeCancellable,
  makePageCallback,
} from './shared/utils';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName, isLinkService, isPageIndex, isPageNumber, isPage, isPdf, isRotate } from './shared/propTypes';

export default class Page extends Component {
  state = {
    page: null,
  }

  componentDidMount() {
    this.loadPage();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      this.getPdf(nextProps, nextContext) !== this.getPdf() ||
      this.getPageNumber(nextProps) !== this.getPageNumber()
    ) {
      callIfDefined(
        this.context.unregisterPage,
        this.pageIndex,
      );

      if (this.state.page !== null) {
        this.setState({ page: null });
      }

      this.loadPage(nextProps, nextContext);
    }
  }

  componentWillUnmount() {
    callIfDefined(
      this.context.unregisterPage,
      this.pageIndex,
    );

    cancelRunningTask(this.runningTask);
  }

  getPdf(props = this.props, context = this.context) {
    return props.pdf || context.pdf;
  }

  getChildContext() {
    if (!this.state.page) {
      return {};
    }

    const context = {
      page: this.state.page,
      pdf: this.getPdf(),
      rotate: this.rotate,
      scale: this.scale,
    };

    if (this.props.onRenderError) {
      context.onRenderError = this.props.onRenderError;
    }
    if (this.props.onRenderSuccess) {
      context.onRenderSuccess = this.props.onRenderSuccess;
    }
    if (this.props.onGetAnnotationsError) {
      context.onGetAnnotationsError = this.props.onGetAnnotationsError;
    }
    if (this.props.onGetAnnotationsSuccess) {
      context.onGetAnnotationsSuccess = this.props.onGetAnnotationsSuccess;
    }
    if (this.props.onGetTextError) {
      context.onGetTextError = this.props.onGetTextError;
    }
    if (this.props.onGetTextSuccess) {
      context.onGetTextSuccess = this.props.onGetTextSuccess;
    }
    if (this.props.customTextRenderer) {
      context.customTextRenderer = this.props.customTextRenderer;
    }
    return context;
  }

  /**
   * Called when a page is loaded successfully
   */
  onLoadSuccess = (page) => {
    this.setState({ page }, () => {
      callIfDefined(
        this.props.onLoadSuccess,
        makePageCallback(page, this.scale),
      );

      callIfDefined(
        this.context.registerPage,
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

  get pageIndex() {
    return this.getPageIndex();
  }

  get pageNumber() {
    return this.getPageNumber();
  }

  get rotate() {
    if (isProvided(this.props.rotate)) {
      return this.props.rotate;
    }

    if (isProvided(this.context.rotate)) {
      return this.context.rotate;
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

  get eventProps() {
    return makeEventProps(this.props, () => {
      const { page } = this.state;
      return makePageCallback(page, this.scale);
    });
  }

  get pageKey() {
    return `${this.state.page.pageIndex}@${this.scale}/${this.rotate}`;
  }

  get pageKeyNoScale() {
    return `${this.state.page.pageIndex}/${this.rotate}`;
  }

  get pageProps() {
    return {
      page: this.state.page,
      rotate: this.rotate,
      scale: this.scale,
    };
  }

  loadPage(props = this.props, context = this.context) {
    const pdf = this.getPdf(props, context);

    if (!pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    const pageNumber = this.getPageNumber(props);

    if (!pageNumber) {
      return null;
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

    return (
      <TextLayer key={`${this.pageKey}_text`} />
    );
  }

  renderAnnotations() {
    const { renderAnnotations } = this.props;

    if (!renderAnnotations) {
      return null;
    }

    return (
      <AnnotationLayer key={`${this.pageKey}_annotations`} />
    );
  }

  renderSVG() {
    return [
      <PageSVG key={`${this.pageKeyNoScale}_svg`} />,
      /**
       * As of now, PDF.js 2.0.120 returns warnings on unimplemented annotations.
       * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
       */
      this.renderAnnotations(),
    ];
  }

  renderCanvas() {
    return [
      <PageCanvas key={`${this.pageKey}_canvas`} />,
      this.renderTextLayer(),
      this.renderAnnotations(),
    ];
  }

  renderNoData() {
    return (
      <div className="react-pdf__message react-pdf__message--no-data">{this.props.noData}</div>
    );
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
    const { pageNumber } = this;
    const pdf = this.getPdf();
    const { className } = this.props;
    const { page } = this.state;

    let content;
    if (!pageNumber) {
      content = this.renderNoData();
    } else if (pdf === null || page === null) {
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
        data-page-number={pageNumber}
        {...this.eventProps}
      >
        {content}
      </div>
    );
  }
}

Page.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotations: true,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: 1.0,
};

Page.childContextTypes = {
  customTextRenderer: PropTypes.func,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage,
  pdf: isPdf,
  rotate: isRotate,
  scale: PropTypes.number,
};

Page.contextTypes = {
  linkService: isLinkService,
  pdf: isPdf,
  registerPage: PropTypes.func,
  rotate: isRotate,
  unregisterPage: PropTypes.func,
};

Page.propTypes = {
  children: PropTypes.node,
  className: isClassName,
  customTextRenderer: PropTypes.func,
  error: PropTypes.string,
  inputRef: PropTypes.func,
  loading: PropTypes.string,
  noData: PropTypes.node,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: isPageIndex,
  pageNumber: isPageNumber,
  renderAnnotations: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
  width: PropTypes.number,
  ...eventsProps(),
};
