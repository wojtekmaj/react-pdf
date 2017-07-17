import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  measureFontOffset,
} from './shared/util';

// Render disproportion above which font will be scaled
const BROKEN_FONT_WARNING_THRESHOLD = 0.025;
// Render disproportion above which font will be considered broken and fallback will be used
const BROKEN_FONT_ALARM_THRESHOLD = 0.1;

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

  alignTextItem(element, width, fontFamily) {
    if (!element) {
      return;
    }

    const { scale } = this.props;

    const transforms = [];

    const targetWidth = width * scale;
    let actualWidth = element.getBoundingClientRect().width;
    let fontOffset = measureFontOffset(fontFamily);
    const fontDisproportion = Math.abs((targetWidth / actualWidth) - 1);

    // Font has some rendering disproportions, possibly due to how spaces are handled
    if (fontDisproportion > BROKEN_FONT_WARNING_THRESHOLD) {
      // Font has severe rendering disproportions, possibly the font is broken completely
      if (fontDisproportion > BROKEN_FONT_ALARM_THRESHOLD) {
        const fallbackFontFamily = fontFamily.split(', ').slice(1).join(', ');
        element.style.fontFamily = fallbackFontFamily;
        actualWidth = element.getBoundingClientRect().width;
        fontOffset = measureFontOffset(fontFamily);
      }
      transforms.push(`scaleX(${targetWidth / actualWidth})`);
    }

    transforms.push(`translateY(${fontOffset * 100}%)`);

    element.style.transform = transforms.join(' ');
  }

  renderTextItem = (textItem, itemIndex) => {
    const [fontSizePx, , , , left, baselineBottom] = textItem.transform;
    const { scale } = this.props;
    // Distance from top of the page to the baseline
    const fontFamily = `${textItem.fontName}, sans-serif`;
    const fontSize = `${fontSizePx * scale}px`;

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

          this.alignTextItem(ref, textItem.width, fontFamily);
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
