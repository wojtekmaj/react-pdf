import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as pdfjs from 'pdfjs-dist';
import makeCancellable from 'make-cancellable-promise';

import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';

import {
  cancelRunningTask,
  errorOnDev,
} from '../shared/utils';

import { isLinkService, isPage, isRotate } from '../shared/propTypes';

export class AnnotationLayerInternal extends PureComponent {
  state = {
    annotations: null,
  }

  componentDidMount() {
    const { page } = this.props;

    if (!page) {
      throw new Error('Attempted to load page annotations, but no page was specified.');
    }

    this.loadAnnotations();
  }

  componentDidUpdate(prevProps) {
    const { page, renderInteractiveForms } = this.props;

    if (
      (prevProps.page && (page !== prevProps.page))
      || renderInteractiveForms !== prevProps.renderInteractiveForms
    ) {
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
      this.onLoadError(error);
    }
  }

  onLoadSuccess = () => {
    const { onGetAnnotationsSuccess } = this.props;
    const { annotations } = this.state;

    if (onGetAnnotationsSuccess) onGetAnnotationsSuccess(annotations);
  }

  onLoadError = (error) => {
    this.setState({ annotations: false });

    errorOnDev(error);

    const { onGetAnnotationsError } = this.props;

    if (onGetAnnotationsError) onGetAnnotationsError(error);
  }

  onRenderSuccess = () => {
    const { onRenderAnnotationLayerSuccess } = this.props;

    if (onRenderAnnotationLayerSuccess) onRenderAnnotationLayerSuccess();
  }

  /**
   * Called when a annotations fails to render.
   */
  onRenderError = (error) => {
    errorOnDev(error);

    const { onRenderAnnotationLayerError } = this.props;

    if (onRenderAnnotationLayerError) onRenderAnnotationLayerError(error);
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport({ scale, rotation: rotate });
  }

  renderAnnotationLayer() {
    const { annotations } = this.state;

    if (!annotations) {
      return;
    }

    const {
      imageResourcesPath,
      linkService,
      page,
      renderInteractiveForms,
    } = this.props;

    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
      imageResourcesPath,
      linkService,
      page,
      renderInteractiveForms,
      viewport,
    };

    this.annotationLayer.innerHTML = '';

    try {
      pdfjs.AnnotationLayer.render(parameters);
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
        {this.renderAnnotationLayer()}
      </div>
    );
  }
}

AnnotationLayerInternal.propTypes = {
  imageResourcesPath: PropTypes.string,
  linkService: isLinkService.isRequired,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
  onRenderAnnotationLayerError: PropTypes.func,
  onRenderAnnotationLayerSuccess: PropTypes.func,
  page: isPage,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
};

const AnnotationLayer = (props) => (
  <DocumentContext.Consumer>
    {(documentContext) => (
      <PageContext.Consumer>
        {(pageContext) => (
          <AnnotationLayerInternal {...documentContext} {...pageContext} {...props} />
        )}
      </PageContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default AnnotationLayer;
