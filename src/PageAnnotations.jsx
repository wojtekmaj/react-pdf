import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './annotation_layer_builder.css';

import {
  makeCancellable,
} from './shared/util';

export default class PageAnnotations extends Component {
  componentDidMount() {
    this.getAnnotations();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.getAnnotations(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport(scale, rotate);
  }

  getAnnotations(props = this.props) {
    this.runningTask = makeCancellable(props.page.getAnnotations());

    return this.runningTask.promise.then((annotations) => {
      this.renderAnnotations(annotations);
    });
  }

  renderAnnotations(annotations) {
    const { page } = this.props;
    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
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

PageAnnotations.propTypes = {
  page: PropTypes.shape({
    getAnnotations: PropTypes.func.isRequired,
    getViewport: PropTypes.func.isRequired,
  }).isRequired,
  rotate: PropTypes.number,
  scale: PropTypes.number,
};
