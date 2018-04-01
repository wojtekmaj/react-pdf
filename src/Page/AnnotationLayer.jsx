import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  makeCancellable,
} from '../shared/utils';

import { isLinkService, isPage, isRotate } from '../shared/propTypes';

export class AnnotationLayerInternal extends PureComponent {
  state = {
    annotations: null,
  }

  componentDidMount() {
    if (!this.props.page) {
      throw new Error('Attempted to load page annotations, but no page was specified.');
    }

    this.loadAnnotations();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.page && (this.props.page !== prevProps.page)) {
      this.loadAnnotations();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadAnnotations = async () => {
    const { page } = this.props;

    try {
      const cancellable = makeCancellable(page.getAnnotations());
      this.runningTask = cancellable;
      const annotations = await cancellable.promise;
      this.setState({ annotations }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ annotations: false });
      this.onLoadError(error);
    }
  }

  onLoadSuccess = () => {
    callIfDefined(
      this.props.onGetAnnotationsSuccess,
      this.state.annotations,
    );
  }

  onLoadError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error);

    callIfDefined(
      this.props.onGetAnnotationsError,
      error,
    );
  }

  onRenderSuccess = () => {
    callIfDefined(
      this.props.onRenderAnnotationsSuccess,
    );
  }

  /**
   * Called when a annotations fails to render.
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
      this.props.onRenderAnnotationsError,
      error,
    );
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport(scale, rotate);
  }

  renderAnnotations() {
    const { annotations } = this.state;

    if (!annotations) {
      return;
    }

    const { linkService, page } = this.props;
    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
      linkService,
      page,
      viewport,
    };

    try {
      PDFJS.AnnotationLayer.render(parameters);
      this.onRenderSuccess();
    } catch (error) {
      this.onRenderError(error);
    }
  }

  render() {
    return (
      <div
        className="react-pdf__Page__annotations annotationLayer"
        ref={(ref) => { this.annotationLayer = ref; }}
      >
        {this.renderAnnotations()}
      </div>
    );
  }
}

AnnotationLayerInternal.propTypes = {
  linkService: isLinkService.isRequired,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
  onRenderAnnotationsError: PropTypes.func,
  onRenderAnnotationsSuccess: PropTypes.func,
  page: isPage,
  rotate: isRotate,
  scale: PropTypes.number,
};

const AnnotationLayer = props => (
  <DocumentContext.Consumer>
    {documentContext => (
      <PageContext.Consumer>
        {pageContext =>
          <AnnotationLayerInternal {...documentContext} {...pageContext} {...props} />
        }
      </PageContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default AnnotationLayer;
