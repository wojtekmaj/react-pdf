import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  errorOnDev,
  makeCancellable,
} from './shared/util';

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

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
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
    if (error === 'cancelled') {
      return;
    }

    errorOnDev(error.message, error);

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

    this.runningTask = makeCancellable(page.getTextContent());

    return this.runningTask.promise
      .then(this.onGetTextSuccess)
      .catch(this.onGetTextError);
  }

  async getFontData(fontFamily) {
    const { page } = this.props;

    const font = await page.commonObjs.ensureObj(fontFamily);

    return font.data;
  }

  getElementWidth = (element) => {
    const { rotate } = this.props;
    const sideways = rotate % 180 !== 0;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  };

  async alignTextItem(element, textItem) {
    if (!element) {
      return;
    }

    const { scale } = this.props;
    const targetWidth = textItem.width * scale;

    const fontData = await this.getFontData(textItem.fontName);

    let actualWidth = this.getElementWidth(element);
    const widthDisproportion = Math.abs((targetWidth / actualWidth) - 1);

    const repairsNeeded = widthDisproportion > BROKEN_FONT_ALARM_THRESHOLD;

    if (repairsNeeded) {
      const fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
      element.style.fontFamily = fallbackFontName;

      actualWidth = this.getElementWidth(element);
    }

    const ascent = fontData ? fontData.ascent : 1;
    element.style.transform = `scaleX(${targetWidth / actualWidth}) translateY(${(1 - ascent) * 100}%)`;
  }

  renderTextItem = (textItem, itemIndex) => {
    const [fontSizePx, , , , left, baselineBottom] = textItem.transform;
    const { scale } = this.props;
    // Distance from top of the page to the baseline
    const { fontName } = textItem;
    const fontSize = `${fontSizePx * scale}px`;

    return (
      <div
        key={itemIndex}
        style={{
          height: '1em',
          fontFamily: fontName,
          fontSize,
          position: 'absolute',
          left: `${left * scale}px`,
          bottom: `${baselineBottom * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
        }}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          this.alignTextItem(ref, textItem);
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
    commonObjs: PropTypes.shape({
      objs: PropTypes.object.isRequired,
    }).isRequired,
    getTextContent: PropTypes.func.isRequired,
    getViewport: PropTypes.func.isRequired,
    transport: PropTypes.shape({
      fontLoader: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  rotate: PropTypes.number,
  scale: PropTypes.number,
};
