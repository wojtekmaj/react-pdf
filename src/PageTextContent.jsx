import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
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

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport(scale, rotate);
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

  scaleTextItem(item, targetWidth) {
    if (!item) {
      return;
    }

    const actualWidth = item.clientWidth;

    item.style.transform = `scale(${targetWidth / actualWidth})`;
  }

  renderTextItem = (textItem, itemIndex) => {
    const [, , , , left, bottom] = textItem.transform;
    const { scale } = this.props;
    const { viewport } = this;
    const top = (viewport.height / scale) - bottom - textItem.height;

    return (
      <div
        key={itemIndex}
        style={{
          position: 'absolute',
          fontSize: `${textItem.height}px`,
          fontFamily: `${textItem.fontName}, sans-serif`,
          height: `${textItem.height}px`,
          top: `${top * scale}px`,
          left: `${left * scale}px`,
          bottom: `${bottom * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'nowrap',
        }}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          this.scaleTextItem(ref, textItem.width * scale);
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
    return (
      <div
        className="ReactPDF__Page__textContent"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          color: 'transparent',
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
  page: PropTypes.object,
  rotate: PropTypes.number,
  scale: PropTypes.number,
};
