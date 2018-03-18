import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { isPage, isRotate } from '../shared/propTypes';

// Render disproportion above which font will be considered broken and fallback will be used
const BROKEN_FONT_ALARM_THRESHOLD = 0.1;

export default class TextLayerItem extends PureComponent {
  state = {
    transform: null,
  }

  componentDidMount() {
    this.alignTextItem();
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

  get sideways() {
    const { rotate } = this;
    return rotate % 180 !== 0;
  }

  get defaultSideways() {
    const { rotation } = this.unrotatedViewport;
    return rotation % 180 !== 0;
  }

  get fontSize() {
    const { transform } = this.props;
    const { defaultSideways } = this;
    const [fontHeightPx, fontWidthPx] = transform;
    return defaultSideways ? fontWidthPx : fontHeightPx;
  }

  get top() {
    const { transform } = this.props;
    const { unrotatedViewport: viewport, defaultSideways } = this;
    const [/* fontHeightPx */, /* fontWidthPx */, offsetX, offsetY, x, y] = transform;
    const [/* xMin */, yMin, /* xMax */, yMax] = viewport.viewBox;
    return defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
  }

  get left() {
    const { transform } = this.props;
    const { unrotatedViewport: viewport, defaultSideways } = this;
    const [/* fontHeightPx */, /* fontWidthPx */, /* offsetX */, /* offsetY */, x, y] = transform;
    const [xMin] = viewport.viewBox;
    return defaultSideways ? y - xMin : x - xMin;
  }

  async getFontData(fontFamily) {
    const { page } = this.context;

    const font = await page.commonObjs.ensureObj(fontFamily);

    return font.data;
  }

  async alignTextItem() {
    if (!this.item) {
      return;
    }

    const element = this.item;
    element.style.transform = '';

    const { scale } = this.context;
    const { fontName, width } = this.props;
    const targetWidth = width * scale;

    const fontData = await this.getFontData(fontName);

    let actualWidth = this.getElementWidth(element);
    const widthDisproportion = Math.abs((targetWidth / actualWidth) - 1);

    const repairsNeeded = widthDisproportion > BROKEN_FONT_ALARM_THRESHOLD;
    if (repairsNeeded) {
      const fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
      element.style.fontFamily = fallbackFontName;

      actualWidth = this.getElementWidth(element);
    }

    const ascent = fontData ? fontData.ascent : 1;

    this.setState({
      transform: `scaleX(${targetWidth / actualWidth}) translateY(${(1 - ascent) * 100}%)`,
    });
  }

  getElementWidth = (element) => {
    const { sideways } = this;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  };

  render() {
    const { fontSize, top, left } = this;
    const { scale } = this.context;
    const { fontName, str: text } = this.props;
    const { transform } = this.state;

    return (
      <div
        style={{
          height: '1em',
          fontFamily: fontName,
          fontSize: `${fontSize * scale}px`,
          position: 'absolute',
          top: `${top * scale}px`,
          left: `${left * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
          pointerEvents: 'all',
          transform,
        }}
        ref={(ref) => { this.item = ref; }}
      >
        {
          this.context.customTextRenderer ?
            this.context.customTextRenderer(this.props) :
            text
        }
      </div>
    );
  }
}

TextLayerItem.contextTypes = {
  customTextRenderer: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

TextLayerItem.propTypes = {
  fontName: PropTypes.string.isRequired,
  itemIndex: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  str: PropTypes.string.isRequired,
  transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number.isRequired,
};
