import _extends from "@babel/runtime/helpers/esm/extends";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import PageContext from '../PageContext';
import { isPage, isRotate } from '../shared/propTypes';
export var TextLayerItemInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(TextLayerItemInternal, _PureComponent);

  var _super = _createSuper(TextLayerItemInternal);

  function TextLayerItemInternal() {
    var _this;

    _classCallCheck(this, TextLayerItemInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "itemElement", /*#__PURE__*/createRef());

    _defineProperty(_assertThisInitialized(_this), "getElementWidth", function (element) {
      var _assertThisInitialize = _assertThisInitialized(_this),
          sideways = _assertThisInitialize.sideways;

      return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
    });

    return _this;
  }

  _createClass(TextLayerItemInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.alignTextItem();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.alignTextItem();
    }
  }, {
    key: "unrotatedViewport",
    get: function get() {
      var _this$props = this.props,
          page = _this$props.page,
          scale = _this$props.scale;
      return page.getViewport({
        scale: scale
      });
    }
    /**
     * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
     * text content.
     */

  }, {
    key: "rotate",
    get: function get() {
      var _this$props2 = this.props,
          page = _this$props2.page,
          rotate = _this$props2.rotate;
      return rotate - page.rotate;
    }
  }, {
    key: "sideways",
    get: function get() {
      var rotate = this.rotate;
      return rotate % 180 !== 0;
    }
  }, {
    key: "defaultSideways",
    get: function get() {
      var rotation = this.unrotatedViewport.rotation;
      return rotation % 180 !== 0;
    }
  }, {
    key: "fontSize",
    get: function get() {
      var transform = this.props.transform;
      var defaultSideways = this.defaultSideways;

      var _transform = _slicedToArray(transform, 2),
          fontHeightPx = _transform[0],
          fontWidthPx = _transform[1];

      return defaultSideways ? fontWidthPx : fontHeightPx;
    }
  }, {
    key: "top",
    get: function get() {
      var transform = this.props.transform;
      var viewport = this.unrotatedViewport,
          defaultSideways = this.defaultSideways;

      var _transform2 = _slicedToArray(transform, 6),

      /* fontHeightPx */

      /* fontWidthPx */
      offsetX = _transform2[2],
          offsetY = _transform2[3],
          x = _transform2[4],
          y = _transform2[5];

      var _viewport$viewBox = _slicedToArray(viewport.viewBox, 4),

      /* xMin */
      yMin
      /* xMax */
      = _viewport$viewBox[1],
          yMax = _viewport$viewBox[3];

      return defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
    }
  }, {
    key: "left",
    get: function get() {
      var transform = this.props.transform;
      var viewport = this.unrotatedViewport,
          defaultSideways = this.defaultSideways;

      var _transform3 = _slicedToArray(transform, 6),

      /* fontHeightPx */

      /* fontWidthPx */

      /* offsetX */

      /* offsetY */
      x = _transform3[4],
          y = _transform3[5];

      var _viewport$viewBox2 = _slicedToArray(viewport.viewBox, 1),
          xMin = _viewport$viewBox2[0];

      return defaultSideways ? y - xMin : x - xMin;
    }
  }, {
    key: "getFontData",
    value: function getFontData(fontName) {
      var page = this.props.page;
      return new Promise(function (resolve) {
        page.commonObjs.get(fontName, resolve);
      });
    }
  }, {
    key: "alignTextItem",
    value: function alignTextItem() {
      var _this2 = this;

      var element = this.itemElement.current;

      if (!element) {
        return;
      }

      element.style.transform = '';
      var _this$props3 = this.props,
          fontName = _this$props3.fontName,
          scale = _this$props3.scale,
          width = _this$props3.width;
      element.style.fontFamily = "".concat(fontName, ", sans-serif");
      this.getFontData(fontName).then(function (fontData) {
        var fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
        element.style.fontFamily = "".concat(fontName, ", ").concat(fallbackFontName);
        var targetWidth = width * scale;

        var actualWidth = _this2.getElementWidth(element);

        var transform = "scaleX(".concat(targetWidth / actualWidth, ")");
        var ascent = fontData ? fontData.ascent : 0;

        if (ascent) {
          transform += " translateY(".concat((1 - ascent) * 100, "%)");
        }

        element.style.transform = transform;
        element.style.WebkitTransform = transform;
      });
    }
  }, {
    key: "render",
    value: function render() {
      var fontSize = this.fontSize,
          top = this.top,
          left = this.left;
      var _this$props4 = this.props,
          customTextRenderer = _this$props4.customTextRenderer,
          scale = _this$props4.scale,
          text = _this$props4.str;
      return /*#__PURE__*/React.createElement("span", {
        ref: this.itemElement,
        style: {
          height: '1em',
          fontFamily: 'sans-serif',
          fontSize: "".concat(fontSize * scale, "px"),
          position: 'absolute',
          top: "".concat(top * scale, "px"),
          left: "".concat(left * scale, "px"),
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
          pointerEvents: 'all'
        }
      }, customTextRenderer ? customTextRenderer(this.props) : text);
    }
  }]);

  return TextLayerItemInternal;
}(PureComponent);
TextLayerItemInternal.propTypes = {
  customTextRenderer: PropTypes.func,
  fontName: PropTypes.string.isRequired,
  itemIndex: PropTypes.number.isRequired,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
  str: PropTypes.string.isRequired,
  transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number.isRequired
};
export default function TextLayerItem(props) {
  return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(TextLayerItemInternal, _extends({}, context, props));
  });
}