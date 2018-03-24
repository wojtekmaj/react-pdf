import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  makeCancellable,
} from '../shared/utils';

import { isLinkService, isPage, isRotate } from '../shared/propTypes';

export default class AnnotationLayer extends Component {
  state = {
    annotations: null,
  }

  componentDidMount() {
    if (!this.context.page) {
      throw new Error('Attempted to load page annotations, but no page was specified.');
    }

    this.loadAnnotations();
  }

  componentDidUpdate(prevProps) {
    if (prevContext.page && (this.context.page !== prevContext.page)) {
      this.loadAnnotations();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadAnnotations = async () => {
    const { page } = this.context;

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
      this.context.onGetAnnotationsSuccess,
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
      this.context.onGetAnnotationsError,
      error,
    );
  }

  onRenderSuccess = () => {
    callIfDefined(
      this.context.onRenderAnnotationsSuccess,
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
      this.context.onRenderError,
      error,
    );
  }

  get viewport() {
    const { page, rotate, scale } = this.context;

    return page.getViewport(scale, rotate);
  }

  renderAnnotations() {
    const { annotations } = this.state;

    if (!annotations) {
      return;
    }

    const { linkService, page } = this.context;
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

AnnotationLayer.contextTypes = {
  linkService: isLinkService,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
  onRenderAnnotationsError: PropTypes.func,
  onRenderAnnotationsSuccess: PropTypes.func,
  page: isPage,
  rotate: isRotate,
  scale: PropTypes.number,
};
