import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  makeCancellable,
} from './shared/util';

export default class PageAnnotations extends Component {
  componentDidMount() {
    this.getAnnotations();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.getAnnotations();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.scale !== this.props.scale) {
      this.getAnnotations(true);
    }
  }

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  getAnnotations(update = false) {
    this.runningTask = makeCancellable(this.props.page.getAnnotations());

    return this.runningTask.promise.then((annotations) => {
      this.renderAnnotations(annotations, update);
    });
  }

  renderAnnotations(annotations, update) {
    const { page, scale } = this.props;
    const viewport = page.getViewport(scale).clone({ dontFlip: true });
    const parameters = {
      div: this.annotationLayer,
      annotations,
      page,
      viewport,
    };

    if (update) {
      PDFJS.AnnotationLayer.update(parameters);
    } else {
      PDFJS.AnnotationLayer.render(parameters);
    }
  }

  render() {
    return (
      <div className="ReactPDF__Page__annotationLayer" ref={(ref) => { this.annotationLayer = ref; }} />
    );
  }
}

PageAnnotations.propTypes = {
  page: PropTypes.shape({
    getAnnotations: PropTypes.func.isRequired,
    getViewport: PropTypes.func.isRequired,
  }).isRequired,
  scale: PropTypes.number,
};
