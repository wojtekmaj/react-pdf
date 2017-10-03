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

  get unrotatedViewport() {
    const { page, scale } = this.props;

    return page.getViewport(scale);
  }

  getAnnotations(props = this.props) {
    this.runningTask = makeCancellable(props.page.getAnnotations());

    return this.runningTask.promise.then((annotations) => {
      this.renderAnnotations(annotations);
    });
  }

  renderAnnotations(annotations) {
    const { page, scale } = this.props;
    const viewport = page.getViewport(scale).clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
      page,
      viewport,
    };

    PDFJS.AnnotationLayer.render(parameters);
  }

  render() {
    const { rotate } = this.props;
    const { unrotatedViewport: viewport } = this;

    return (
      <div
        className="ReactPDF__Page__annotations annotationLayer"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        }}
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
