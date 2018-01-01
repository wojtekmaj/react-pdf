import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './annotation_layer_builder.css';

import {
  callIfDefined,
  errorOnDev,
  makeCancellable,
} from './shared/utils';

import { isLinkService, isPage, isRotate } from './shared/propTypes';

export default class PageAnnotations extends Component {
  state = {
    annotations: null,
  }

  componentDidMount() {
    this.getAnnotations();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextContext.page !== this.context.page) {
      this.getAnnotations(nextContext);
    }
  }

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  onGetAnnotationsSuccess = (annotations) => {
    callIfDefined(
      this.props.onGetAnnotationsSuccess,
      annotations,
    );

    this.setState({ annotations });
  }

  onGetAnnotationsError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error.message, error);

    callIfDefined(
      this.props.onGetAnnotationsError,
      error,
    );

    this.setState({ annotations: false });
  }

  get viewport() {
    const { page, rotate, scale } = this.context;

    return page.getViewport(scale, rotate);
  }

  getAnnotations(context = this.context) {
    this.runningTask = makeCancellable(context.page.getAnnotations());

    return this.runningTask.promise
      .then(this.onGetAnnotationsSuccess)
      .catch(this.onGetAnnotationsError);
  }

  renderAnnotations() {
    const { annotations } = this.state;

    if (!annotations) {
      return null;
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

    return PDFJS.AnnotationLayer.render(parameters);
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

PageAnnotations.contextTypes = {
  linkService: isLinkService,
  page: isPage,
  rotate: isRotate,
};

PageAnnotations.propTypes = {
  page: isPage,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
};
