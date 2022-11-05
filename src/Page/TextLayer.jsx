import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

import PageContext from '../PageContext';

import { cancelRunningTask } from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export class TextLayerInternal extends PureComponent {
  state = {
    textContent: null,
  };

  layerElement = createRef();

  componentDidMount() {
    const { page } = this.props;

    invariant(page, 'Attempted to load page text content, but no page was specified.');

    warning(
      parseInt(
        window.getComputedStyle(document.body).getPropertyValue('--react-pdf-text-layer'),
        10,
      ) === 1,
      'TextLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-text-layer',
    );

    this.loadTextContent();
  }

  componentDidUpdate(prevProps) {
    const { page } = this.props;

    if (prevProps.page && page !== prevProps.page) {
      this.loadTextContent();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadTextContent = () => {
    const { page } = this.props;

    const cancellable = makeCancellable(page.getTextContent());
    this.runningTask = cancellable;

    cancellable.promise
      .then((textContent) => {
        this.setState({ textContent }, this.onLoadSuccess);
      })
      .catch((error) => {
        this.onLoadError(error);
      });
  };

  onLoadSuccess = () => {
    const { onGetTextSuccess } = this.props;
    const { textContent } = this.state;

    if (onGetTextSuccess) onGetTextSuccess(textContent);
  };

  onLoadError = (error) => {
    this.setState({ textItems: false });

    warning(error);

    const { onGetTextError } = this.props;

    if (onGetTextError) onGetTextError(error);
  };

  onRenderSuccess = () => {
    const { onRenderTextLayerSuccess } = this.props;

    if (onRenderTextLayerSuccess) onRenderTextLayerSuccess();
  };

  onRenderError = (error) => {
    warning(error);

    const { onRenderTextLayerError } = this.props;

    if (onRenderTextLayerError) onRenderTextLayerError(error);
  };

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport({ scale, rotation: rotate });
  }

  get unrotatedViewport() {
    const { page, scale } = this.props;

    return page.getViewport({ scale });
  }

  /**
   * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
   * text content.
   */
  get rotate() {
    const { page, rotate } = this.props;
    return rotate - page.rotate;
  }

  renderTextLayer() {
    const { textContent } = this.state;

    if (!textContent) {
      return null;
    }

    const { viewport } = this;
    const { customTextRenderer } = this.props;

    // If another rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask);

    const parameters = {
      container: this.layerElement.current,
      textContent,
      viewport,
    };

    this.layerElement.current.innerHTML = '';

    this.runningTask = pdfjs.renderTextLayer(parameters);
    const cancellable = makeCancellable(this.runningTask.promise);
    this.runningTask = cancellable;

    cancellable.promise
      .then(() => {
        if (customTextRenderer) {
          Array.from(this.layerElement.current.children).forEach((element, elementIndex) => {
            const content = customTextRenderer({
              itemIndex: elementIndex,
              ...textContent.items[elementIndex],
            });
            element.innerHTML = content;
          });
        }
        this.onRenderSuccess();
      })
      .catch((error) => {
        this.onRenderError(error);
      });
  }

  render() {
    return (
      <div className="react-pdf__Page__textContent textLayer" ref={this.layerElement}>
        {this.renderTextLayer()}
      </div>
    );
  }
}

TextLayerInternal.propTypes = {
  customTextRenderer: PropTypes.func,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onRenderTextLayerError: PropTypes.func,
  onRenderTextLayerSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

export default function TextLayer(props) {
  return (
    <PageContext.Consumer>
      {(context) => <TextLayerInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
