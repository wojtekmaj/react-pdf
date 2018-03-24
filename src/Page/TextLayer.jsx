import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TextLayerItem from './TextLayerItem';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  makeCancellable,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export default class TextLayer extends Component {
  state = {
    textItems: null,
  }

  componentDidMount() {
    if (!this.context.page) {
      throw new Error('Attempted to load page text content, but no page was specified.');
    }

    this.loadTextItems();
  }

  componentDidUpdate(prevProps) {
    if (prevContext.page && (this.context.page !== prevContext.page)) {
      this.loadTextItems();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadTextItems = async () => {
    const { page } = this.context;

    try {
      const cancellable = makeCancellable(page.getTextContent());
      this.runningTask = cancellable;
      const { textItems } = await cancellable.promise;
      this.setState({ textItems }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ textItems: false });
      this.onLoadError(error);
    }
  }

  onLoadSuccess = () => {
    callIfDefined(
      this.context.onGetTextSuccess,
      this.state.textItems,
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
      this.context.onGetTextError,
      error,
    );
  }

  get unrotatedViewport() {
    const { page, scale } = this.context;

    return page.getViewport(scale);
  }

  /**
   * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
   * text content.
   */
  get rotate() {
    const { page, rotate } = this.context;
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

TextLayer.contextTypes = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};
