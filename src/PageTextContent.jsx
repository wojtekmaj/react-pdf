import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  measureFontOffset,
} from './shared/util';

export default class PageTextContent extends Component {
  state = {
    textItems: null,
  }

  componentDidMount() {
    this.getTextContent();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.getTextContent(nextProps);
    }
  }

  onGetTextSuccess = (textContent) => {
    let textItems = null;
    if (textContent) {
      textItems = textContent.items;
    }

    callIfDefined(
      this.props.onGetTextSuccess,
      textItems,
    );

    this.setState({ textItems });
  }

  onGetTextError = (error) => {
    callIfDefined(
      this.props.onGetTextError,
      error,
    );

    this.setState({ textItems: false });
  }

  get unrotatedViewport() {
    const { page, scale } = this.props;

    return page.getViewport(scale);
  }

  getTextContent(props = this.props) {
    const { page } = props;

    if (!page) {
      throw new Error('Attempted to load page text content, but no page was specified.');
    }

    if (this.state.textItems !== null) {
      this.setState({ textItems: null });
    }

    page.getTextContent()
      .then(this.onGetTextSuccess)
      .catch(this.onGetTextError);
  }

  alignTextItem(item, targetWidth, fontOffset) {
    if (!item) {
      return;
    }

    const actualWidth = item.clientWidth;

    item.style.transform =
      `scale(${targetWidth / actualWidth}) translateY(${fontOffset * 100}%)`;
  }

  renderTextItem = (textItem, itemIndex) => {
    const [, , , , left, baselineBottom] = textItem.transform;
    const { scale } = this.props;
    // Distance from top of the page to the baseline
    const fontFamily = `${textItem.fontName}, sans-serif`;
    const fontSize = `${textItem.height}px`;

    return (
      <div
        key={itemIndex}
        style={{
          position: 'absolute',
          fontSize,
          fontFamily,
          height: '1em',
          left: `${left * scale}px`,
          bottom: `${baselineBottom * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
        }}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          const targetWidth = textItem.width * scale;
          const fontOffset = measureFontOffset(fontFamily);
          this.alignTextItem(ref, targetWidth, fontOffset);
        }}
      >
        {textItem.str}
      </div>
    );
  }

  renderTextItems() {
    const { textItems } = this.state;

    if (!textItems) {
      return null;
    }

    return textItems.map(this.renderTextItem);
  }

  render() {
    const { rotate } = this.props;
    const { unrotatedViewport: viewport } = this;

    return (
      <div
        className="ReactPDF__Page__textContent"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          color: 'transparent',
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        }}
      >
        {this.renderTextItems()}
      </div>
    );
  }
}

PageTextContent.propTypes = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: PropTypes.shape({
    getTextContent: PropTypes.func.isRequired,
    getViewport: PropTypes.func.isRequired,
  }).isRequired,
  rotate: PropTypes.number,
  scale: PropTypes.number,
};
