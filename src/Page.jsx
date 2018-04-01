import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import DocumentContext from './DocumentContext';
import PageContext from './PageContext';

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

import { eventsProps, isClassName, isPageIndex, isPageNumber, isPdf, isRotate } from './shared/propTypes';

export class PageInternal extends PureComponent {
  state = {
    page: null,
  }

  componentDidMount() {
    if (!this.props.pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    this.loadPage();
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.pdf && (this.props.pdf !== prevProps.pdf)) ||
      this.getPageNumber() !== this.getPageNumber(prevProps)
    ) {
      callIfDefined(
        this.props.unregisterPage,
        this.getPageIndex(prevProps),
      );

      this.loadPage();
    }
  }

  componentWillUnmount() {
    callIfDefined(
      this.props.unregisterPage,
      this.pageIndex,
    );

    cancelRunningTask(this.runningTask);
  }

  get childContext() {
    if (!this.state.page) {
      return {};
    }

    return {
      customTextRenderer: this.props.customTextRenderer,
      onGetAnnotationsError: this.props.onGetAnnotationsError,
      onGetAnnotationsSuccess: this.props.onGetAnnotationsSuccess,
      onGetTextError: this.props.onGetTextError,
      onGetTextSuccess: this.props.onGetTextSuccess,
      onRenderAnnotationsError: this.props.onRenderAnnotationsError,
      onRenderAnnotationsSuccess: this.props.onRenderAnnotationsSuccess,
      onRenderError: this.props.onRenderError,
      onRenderSuccess: this.props.onRenderSuccess,
      page: this.state.page,
      rotate: this.rotate,
      scale: this.scale,
    };
  }

  /**
   * Called when a page is loaded successfully
   */
  onLoadSuccess = () => {
    callIfDefined(
      this.props.onLoadSuccess,
      makePageCallback(this.state.page, this.scale),
    );

    callIfDefined(
      this.props.registerPage,
      this.pageIndex,
      this.ref,
    );
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

    errorOnDev(error);

    callIfDefined(
      this.props.onLoadError,
      error,
    );
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

    const { page } = this.state;

    if (!page) {
      return null;
    }

    return page.rotate;
  }

  get scale() {
    const { scale, width } = this.props;
    const { page } = this.state;

    if (!page) {
      return null;
    }

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
      if (!this.state.page) {
        return this.state.page;
      }

      return makePageCallback(this.state.page, this.scale);
    });
  }

  get pageKey() {
    return `${this.state.page.pageIndex}@${this.scale}/${this.rotate}`;
  }

  get pageKeyNoScale() {
    return `${this.state.page.pageIndex}/${this.rotate}`;
  }

  loadPage = async () => {
    const { pdf } = this.props;

    const pageNumber = this.getPageNumber();

    if (!pageNumber) {
      return;
    }

    let page = null;
    try {
      const cancellable = makeCancellable(pdf.getPage(pageNumber));
      this.runningTask = cancellable;
      page = await cancellable.promise;
      this.setState({ page }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ page: false });
      this.onLoadError(error);
    }
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

    return (
      <PageContext.Provider value={this.childContext}>
        {
          renderMode === 'svg' ?
            this.renderSVG() :
            this.renderCanvas()
        }
        {children}
      </PageContext.Provider>
    );
  }

  render() {
    const { pageNumber } = this;
    const { className, pdf } = this.props;
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

PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotations: true,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: 1.0,
};

PageInternal.propTypes = {
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
  pdf: isPdf,
  registerPage: PropTypes.func,
  renderAnnotations: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
  unregisterPage: PropTypes.func,
  width: PropTypes.number,
  ...eventsProps(),
};

const Page = props => (
  <DocumentContext.Consumer>
    {context => <PageInternal {...context} {...props} />}
  </DocumentContext.Consumer>
);

export default Page;
