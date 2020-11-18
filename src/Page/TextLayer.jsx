import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';

import PageContext from '../PageContext';

import TextLayerItem from './TextLayerItem';
import EndOfContent from './EndOfContent';

import {
  cancelRunningTask,
  errorOnDev,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

const DEFAULT_END_OF_CONTENT_TOP = '100%';

export class TextLayerInternal extends PureComponent {
  state = {
    textItems: null,
    endOfContentTop: DEFAULT_END_OF_CONTENT_TOP,
  }

  endOfContentRef = createRef();

  textLayerRef = createRef();

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

  onMouseDown = (evt) => {
    if (
      !this.textLayerRef.current
       || !this.endOfContentRef.current
        || evt.target === this.textLayerRef.current
    ) {
      return;
    }

    const endOfContentEl = this.endOfContentRef.current;
    const textLayerEl = this.textLayerRef.current;

    const isFirefox = window
      .getComputedStyle(endOfContentEl)
      .getPropertyValue('-moz-user-select') === 'none';
    if (isFirefox) {
      this.setState({
        endOfContentTop: '0',
      });
    } else {
      const divBounds = textLayerEl.getBoundingClientRect();
      const r = Math.max(0, (evt.clientY - divBounds.top) / divBounds.height);
      this.setState({
        endOfContentTop: `${(r * 100).toFixed(2)}%`,
      });
    }
  }

  onMouseUp = () => {
    this.setState({
      endOfContentTop: DEFAULT_END_OF_CONTENT_TOP,
    });
  }

  render() {
    const {
      unrotatedViewport: viewport,
      rotate,
      textLayerRef,
      endOfContentRef,
    } = this;
    const { endOfContentTop, textItems } = this.state;

    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className="react-pdf__Page__textContent"
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          ref={textLayerRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${viewport.width}px`,
            height: `${viewport.height}px`,
            color: 'transparent',
            transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
            WebkitTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
          }}
        >
          {this.renderTextItems()}
          {textItems && <EndOfContent key="endOfContent" ref={endOfContentRef} top={endOfContentTop} />}
        </div>
      </>
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
      {context => <TextLayerInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
