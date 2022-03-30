import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';

import { cancelRunningTask } from '../shared/utils';

import { isLinkService, isPage, isRotate } from '../shared/propTypes';

export class AnnotationLayerInternal extends PureComponent {
  state = {
    annotations: null,
  };

  layerElement = createRef();

  componentDidMount() {
    const { page } = this.props;

    invariant(page, 'Attempted to load page annotations, but no page was specified.');

    this.loadAnnotations();
  }

  componentDidUpdate(prevProps) {
    const { page, renderForms } = this.props;

    if ((prevProps.page && page !== prevProps.page) || renderForms !== prevProps.renderForms) {
      this.loadAnnotations();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadAnnotations = () => {
    const { page } = this.props;

    const cancellable = makeCancellable(page.getAnnotations());
    this.runningTask = cancellable;

    cancellable.promise
      .then((annotations) => {
        this.setState({ annotations }, this.onLoadSuccess);
      })
      .catch((error) => {
        this.onLoadError(error);
      });
  };

  onLoadSuccess = () => {
    const { onGetAnnotationsSuccess } = this.props;
    const { annotations } = this.state;

    if (onGetAnnotationsSuccess) onGetAnnotationsSuccess(annotations);
  };

  onLoadError = (error) => {
    this.setState({ annotations: false });

    warning(error);

    const { onGetAnnotationsError } = this.props;

    if (onGetAnnotationsError) onGetAnnotationsError(error);
  };

  onRenderSuccess = () => {
    const { onRenderAnnotationLayerSuccess } = this.props;

    if (onRenderAnnotationLayerSuccess) onRenderAnnotationLayerSuccess();
  };

  onRenderError = (error) => {
    warning(error);

    const { onRenderAnnotationLayerError } = this.props;

    if (onRenderAnnotationLayerError) onRenderAnnotationLayerError(error);
  };

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport({ scale, rotation: rotate });
  }

  renderAnnotationLayer() {
    const { annotations } = this.state;

    if (!annotations) {
      return;
    }

    const { imageResourcesPath, linkService, page, renderForms } = this.props;

    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.layerElement.current,
      imageResourcesPath,
      linkService,
      page,
      renderForms,
      viewport,
    };

    this.layerElement.current.innerHTML = '';

    try {
      pdfjs.AnnotationLayer.render(parameters);
      this.onRenderSuccess();
    } catch (error) {
      this.onRenderError(error);
    }
  }

  render() {
    return (
      <div className="react-pdf__Page__annotations annotationLayer" ref={this.layerElement}>
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
  renderForms: PropTypes.bool,
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
