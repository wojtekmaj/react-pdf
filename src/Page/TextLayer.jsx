import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';

import PageContext from '../PageContext';

import TextLayerItem from './TextLayerItem';

import {
  cancelRunningTask,
  errorOnDev,
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

  loadTextItems = () => {
    const { page } = this.props;

    const cancellable = makeCancellable(page.getTextContent());
    this.runningTask = cancellable;

    cancellable.promise
      .then(({ items: textItems }) => {
        this.setState({ textItems }, this.onLoadSuccess);
      })
      .catch((error) => {
        this.onLoadError(error);
      });
  }

  onLoadSuccess = () => {
    const { onGetTextSuccess } = this.props;
    const { textItems } = this.state;

    if (onGetTextSuccess) onGetTextSuccess(textItems);
  }

  onLoadError = (error) => {
    this.setState({ textItems: false });

    errorOnDev(error);

    const { onGetTextError } = this.props;

    if (onGetTextError) onGetTextError(error);
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
          WebkitTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
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

export default function TextLayer(props) {
  return (
    <PageContext.Consumer>
      {(context) => <TextLayerInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
