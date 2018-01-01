import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  callIfDefined,
  errorOnDev,
  makeCancellable,
} from './shared/util';

import { isPage, isRotate } from './shared/propTypes';

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
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
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

  /**
   * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
   * text content.
   */
  get rotate() {
    const { page, rotate } = this.props;
    return rotate - page.rotate;
  }

  get sideways() {
    const { rotate } = this;
    return rotate % 180 !== 0;
  }

  get defaultSideways() {
    const { rotation } = this.unrotatedViewport;
    return rotation % 180 !== 0;
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
    const { sideways } = this;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  };

  async alignTextItem(element, textItem) {
    if (!element) {
      return;
    }

    element.style.transform = '';

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
    const { unrotatedViewport: viewport, defaultSideways } = this;
    const { scale } = this.props;

    const [xMin, yMin, /* xMax */, yMax] = viewport.viewBox;

    const { fontName, transform } = textItem;
    const [fontHeightPx, fontWidthPx, offsetX, offsetY, x, y] = transform;

    const fontSizePx = defaultSideways ? fontWidthPx : fontHeightPx;
    const top = defaultSideways ? x + offsetX : (yMax - yMin) - (y + offsetY);
    const left = defaultSideways ? y : x;

    const fontSize = `${fontSizePx * scale}px`;

    return (
      <div
        key={itemIndex}
        style={{
          height: '1em',
          fontFamily: fontName,
          fontSize,
          position: 'absolute',
          top: `${(top + yMin) * scale}px`,
          left: `${(left - xMin) * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
          pointerEvents: 'all',
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
    const { unrotatedViewport: viewport, rotate } = this;

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
          pointerEvents: 'none',
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
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};
