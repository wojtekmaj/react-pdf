import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import mergeRefs from 'merge-refs';

import DocumentContext from './DocumentContext';
import PageContext from './PageContext';

import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';

import {
  cancelRunningTask,
  errorOnDev,
  isProvided,
  makePageCallback,
} from './shared/utils';

import {
  eventProps,
  isClassName,
  isPageIndex,
  isPageNumber,
  isPdf,
  isRef,
  isRenderMode,
  isRotate,
} from './shared/propTypes';

const defaultScale = 1.0;

export class PageInternal extends PureComponent {
  state = {
    page: null,
  }

  componentDidMount() {
    const { pdf } = this.props;

    if (!pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    this.loadPage();
  }

  componentDidUpdate(prevProps) {
    const { pdf } = this.props;

    if (
      (prevProps.pdf && (pdf !== prevProps.pdf))
      || this.getPageNumber() !== this.getPageNumber(prevProps)
    ) {
      const { unregisterPage } = this.props;

      if (unregisterPage) unregisterPage(this.getPageIndex(prevProps));

      this.loadPage();
    }
  }

  componentWillUnmount() {
    const { unregisterPage } = this.props;

    if (unregisterPage) unregisterPage(this.pageIndex);

    cancelRunningTask(this.runningTask);
  }

  get childContext() {
    const { page } = this.state;

    if (!page) {
      return {};
    }

    const {
      customTextRenderer,
      onGetAnnotationsError,
      onGetAnnotationsSuccess,
      onGetTextError,
      onGetTextSuccess,
      onRenderAnnotationLayerError,
      onRenderAnnotationLayerSuccess,
      onRenderError,
      onRenderSuccess,
      renderInteractiveForms,
    } = this.props;

    return {
      customTextRenderer,
      onGetAnnotationsError,
      onGetAnnotationsSuccess,
      onGetTextError,
      onGetTextSuccess,
      onRenderAnnotationLayerError,
      onRenderAnnotationLayerSuccess,
      onRenderError,
      onRenderSuccess,
      page,
      renderInteractiveForms,
      rotate: this.rotate,
      scale: this.scale,
    };
  }

  /**
   * Called when a page is loaded successfully
   */
  onLoadSuccess = () => {
    const { onLoadSuccess, registerPage } = this.props;
    const { page } = this.state;

    if (onLoadSuccess) onLoadSuccess(makePageCallback(page, this.scale));

    if (registerPage) registerPage(this.pageIndex, this.ref);
  }

  /**
   * Called when a page failed to load
   */
  onLoadError = (error) => {
    errorOnDev(error);

    const { onLoadError } = this.props;

    if (onLoadError) onLoadError(error);
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
    const { rotate } = this.props;

    if (isProvided(rotate)) {
      return rotate;
    }

    const { page } = this.state;

    if (!page) {
      return null;
    }

    return page.rotate;
  }

  get scale() {
    const { page } = this.state;

    if (!page) {
      return null;
    }

    const { scale, width, height } = this.props;
    const { rotate } = this;

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // Passing scale explicitly null would cause the page not to render
    const scaleWithDefault = scale === null ? defaultScale : scale;

    // If width/height is defined, calculate the scale of the page so it could be of desired width.
    if (width || height) {
      const viewport = page.getViewport({ scale: 1, rotation: rotate });
      pageScale = width
        ? width / viewport.width
        : height / viewport.height;
    }

    return scaleWithDefault * pageScale;
  }

  get eventProps() {
    return makeEventProps(this.props, () => {
      const { page } = this.state;
      if (!page) {
        return page;
      }

      return makePageCallback(page, this.scale);
    });
  }

  get pageKey() {
    const { page } = this.state;

    return `${page.pageIndex}@${this.scale}/${this.rotate}`;
  }

  get pageKeyNoScale() {
    const { page } = this.state;

    return `${page.pageIndex}/${this.rotate}`;
  }

  loadPage = async () => {
    const { pdf } = this.props;

    const pageNumber = this.getPageNumber();

    if (!pageNumber) {
      return;
    }

    this.setState((prevState) => {
      if (!prevState.page) {
        return null;
      }
      return { page: null };
    });

    try {
      const cancellable = makeCancellable(pdf.getPage(pageNumber));
      this.runningTask = cancellable;
      const page = await cancellable.promise;
      this.setState({ page }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ page: false });
      this.onLoadError(error);
    }
  }

  renderMainLayer() {
    const { canvasRef, renderMode } = this.props;

    switch (renderMode) {
      case 'none':
        return null;
      case 'svg':
        return (
          <PageSVG key={`${this.pageKeyNoScale}_svg`} />
        );
      case 'canvas':
      default:
        return (
          <PageCanvas
            key={`${this.pageKey}_canvas`}
            canvasRef={canvasRef}
          />
        );
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

  renderAnnotationLayer() {
    const { renderAnnotationLayer } = this.props;

    if (!renderAnnotationLayer) {
      return null;
    }

    /**
     * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
     * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
     */

    return (
      <AnnotationLayer key={`${this.pageKey}_annotations`} />
    );
  }

  renderChildren() {
    const {
      children,
    } = this.props;

    return (
      <PageContext.Provider value={this.childContext}>
        {this.renderMainLayer()}
        {this.renderTextLayer()}
        {this.renderAnnotationLayer()}
        {children}
      </PageContext.Provider>
    );
  }

  renderContent() {
    const { pageNumber } = this;
    const { pdf } = this.props;
    const { page } = this.state;

    if (!pageNumber) {
      const { noData } = this.props;

      return (
        <Message type="no-data">
          {typeof noData === 'function' ? noData() : noData}
        </Message>
      );
    }

    if (pdf === null || page === null) {
      const { loading } = this.props;

      return (
        <Message type="loading">
          {typeof loading === 'function' ? loading() : loading}
        </Message>
      );
    }

    if (pdf === false || page === false) {
      const { error } = this.props;

      return (
        <Message type="error">
          {typeof error === 'function' ? error() : error}
        </Message>
      );
    }

    return this.renderChildren();
  }

  render() {
    const { pageNumber } = this;
    const { className, inputRef } = this.props;

    return (
      <div
        className={mergeClassNames('react-pdf__Page', className)}
        data-page-number={pageNumber}
        ref={mergeRefs(inputRef, this.ref)}
        style={{ position: 'relative' }}
        {...this.eventProps}
      >
        {this.renderContent()}
      </div>
    );
  }
}

PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotationLayer: true,
  renderInteractiveForms: false,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: defaultScale,
};

const isFunctionOrNode = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.node,
]);

PageInternal.propTypes = {
  ...eventProps,
  children: PropTypes.node,
  className: isClassName,
  customTextRenderer: PropTypes.func,
  error: isFunctionOrNode,
  height: PropTypes.number,
  inputRef: isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
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
  renderAnnotationLayer: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  renderMode: isRenderMode,
  renderTextLayer: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
  unregisterPage: PropTypes.func,
  width: PropTypes.number,
};

function Page(props, ref) {
  return (
    <DocumentContext.Consumer>
      {(context) => (
        <PageInternal
          ref={ref}
          {...context}
          {...props}
        />
      )}
    </DocumentContext.Consumer>
  );
}

export default React.forwardRef(Page);
