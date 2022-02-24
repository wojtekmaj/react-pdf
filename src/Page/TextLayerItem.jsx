import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PageContext from '../PageContext';

import { isPage, isRotate } from '../shared/propTypes';

export class TextLayerItemInternal extends PureComponent {
  componentDidMount() {
    this.initTextItem();
  }

  componentDidUpdate() {
    this.initTextItem();
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
    const [, , /* fontHeightPx */ /* fontWidthPx */ offsetX, offsetY, x, y] = transform;
    const [, /* xMin */ yMin /* xMax */, , yMax] = viewport.viewBox;
    return defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
  }

  get left() {
    const { transform } = this.props;
    const { unrotatedViewport: viewport, defaultSideways } = this;
    const [, , , , /* fontHeightPx */ /* fontWidthPx */ /* offsetX */ /* offsetY */ x, y] =
      transform;
    const [xMin] = viewport.viewBox;
    return defaultSideways ? y - xMin : x - xMin;
  }

  getFontData(fontName) {
    const { page } = this.props;

    return new Promise((resolve) => {
      page.commonObjs.get(fontName, resolve);
    });
  }

  initTextItem = () => {
    const element = this.item;

    if (!element) {
      this.props.onLoadSuccessAlignTextItem()
      return;
    }

    if(!this.fontFamily && this.props.str.length > 0){
      this.fontFamily = element.style.fontFamily
      this.loadTextItem()
    } else {
      this.props.onLoadSuccessAlignTextItem()
    }
  }

  loadTextItem = async() => {
    const element = this.item;
    const { fontName } = this.props;

    let fontData = await this.getFontData(fontName)
    const fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';

    this.fontFamily = `${fontName}, ${fallbackFontName}`;
    this.ascent = fontData ? fontData.ascent : 0;
    if(this.fontFamily !== element.style.fontFamily){
      element.style.fontFamily = this.fontFamily
    }
    this.props.onLoadSuccessAlignTextItem()
  }

  updateElementWidth = () => {
    const element = this.item;
    if(element){
      let actualWidth = this.getElementWidth(element);

      if(this.actualWidth !== actualWidth && actualWidth > 0){
        this.actualWidth = actualWidth
        return true
      }
    }
    return false
  }

  updatedWidth = (width) => {
    this.actualWidth = width
    return this
  }

  alignTextItem = async() => {
    const element = this.item;
    const { scale, width } = this.props;

    const targetWidth = width * scale;  
    let transform = `scaleX(${targetWidth / this.actualWidth})`;

    if (this.ascent) {
      transform += ` translateY(${(1 - this.ascent) * 100}%)`;
    }
    element.style.transform = transform;
    element.style.WebkitTransform = transform;
  }

  /* alignTextItem() {
    const element = this.item;

    if (!element) {
      return;
    }

    element.style.transform = '';

    const { fontName, scale, width } = this.props;

    element.style.fontFamily = `${fontName}, sans-serif`;

    this.getFontData(fontName).then((fontData) => {
      const fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
      element.style.fontFamily = `${fontName}, ${fallbackFontName}`;

      const targetWidth = width * scale;
      const actualWidth = this.getElementWidth(element);

      let transform = `scaleX(${targetWidth / actualWidth})`;

      const ascent = fontData ? fontData.ascent : 0;
      if (ascent) {
        transform += ` translateY(${(1 - ascent) * 100}%)`;
      }

      element.style.transform = transform;
      element.style.WebkitTransform = transform;
    });
  }*/

  getElementWidth = (element) => {
    const { sideways } = this;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  };

  render() {
    const { fontName, fontSize, top, left } = this;
    const { customTextRenderer, scale, str: text } = this.props;

    return (
      <span
        ref={(ref) => {
          this.item = ref;
        }}
        style={{
          height: '1em',
          fontFamily: `${fontName}, sans-serif`,
          fontSize: `${fontSize * scale}px`,
          position: 'absolute',
          top: `${top * scale}px`,
          left: `${left * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
          pointerEvents: 'all',
        }}
      >
        {customTextRenderer ? customTextRenderer(this.props) : text}
      </span>
    );
  }
}

TextLayerItemInternal.propTypes = {
  customTextRenderer: PropTypes.func,
  fontName: PropTypes.string.isRequired,
  itemIndex: PropTypes.number.isRequired,
  page: isPage.isRequired,
  onLoadSuccessAlignTextItem: PropTypes.func.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
  str: PropTypes.string.isRequired,
  transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number.isRequired,
};

const TextLayerItem = React.forwardRef((props, ref) => (
  <PageContext.Consumer>
    {(context) => <TextLayerItemInternal ref={ref} {...context} {...props} />}
  </PageContext.Consumer>
 ));

export default TextLayerItem