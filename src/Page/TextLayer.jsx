import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PageContext from '../PageContext';

import TextLayerItem from './TextLayerItem';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  isCancelException,
  makeCancellable,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export class TextLayerInternal extends PureComponent {
  state = {
    textItems: null,
  }

  componentDidMount() {
    const { page } = this.props;

    if (!page) {
      throw new Error('Attempted to load page text content, but no page was specified.');
    }

    this.loadTextItems();
  }

  componentDidUpdate(prevProps) {
    const { page } = this.props;

    if (prevProps.page && (page !== prevProps.page)) {
      this.loadTextItems();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadTextItems = async () => {
    const { page } = this.props;

    try {
      const cancellable = makeCancellable(page.getTextContent());
      this.runningTask = cancellable;
      const { items: textItems } = await cancellable.promise;
      this.setState({ textItems }, this.onLoadSuccess);
    } catch (error) {
      this.onLoadError(error);
    }
  }

  onLoadSuccess = () => {
    const { onGetTextSuccess } = this.props;
    const { textItems } = this.state;

    callIfDefined(
      onGetTextSuccess,
      textItems,
    );
  }

  onLoadError = (error) => {
    if (isCancelException(error)) {
      return;
    }

    this.setState({ textItems: false });

    errorOnDev(error);

    const { onGetTextError } = this.props;

    callIfDefined(
      onGetTextError,
      error,
    );
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

  renderTextItems() {
    const { textItems } = this.state;

    if (!textItems) {
      return null;
    }

    return textItems.map((textItem, itemIndex) => (
      <TextLayerItem
        // eslint-disable-next-line react/no-array-index-key
        key={itemIndex}
        itemIndex={itemIndex}
        {...textItem}
      />
    ));
  }

  render() {
    const { unrotatedViewport: viewport, rotate } = this;

    return (
      <div
        className="react-pdf__Page__textContent"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          color: 'transparent',
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
          pointerEvents: 'none',
        }}
      >
        {this.renderTextItems()}
      </div>
    );
  }
}

TextLayerInternal.propTypes = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

const TextLayer = props => (
  <PageContext.Consumer>
    {context => <TextLayerInternal {...context} {...props} />}
  </PageContext.Consumer>
);

export default TextLayer;
