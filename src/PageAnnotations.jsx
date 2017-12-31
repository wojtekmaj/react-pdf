import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './annotation_layer_builder.css';

import { makeCancellable } from './shared/util';

import { linkServiceProp, pageProp, rotateProp } from './shared/propTypes';

export default class PageAnnotations extends Component {
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

  get viewport() {
    const { page, rotate, scale } = this.context;

    return page.getViewport(scale, rotate);
  }

  getAnnotations(context = this.context) {
    this.runningTask = makeCancellable(context.page.getAnnotations());

    return this.runningTask.promise.then((annotations) => {
      this.renderAnnotations(annotations);
    });
  }

  renderAnnotations(annotations) {
    const { linkService, page } = this.context;
    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
      linkService,
      page,
      viewport,
    };

    PDFJS.AnnotationLayer.render(parameters);
  }

  render() {
    return (
      <div
        className="ReactPDF__Page__annotations annotationLayer"
        ref={(ref) => { this.annotationLayer = ref; }}
      />
    );
  }
}

PageAnnotations.contextTypes = {
  linkService: linkServiceProp,
  page: pageProp,
  rotate: rotateProp,
  scale: PropTypes.number,
};
