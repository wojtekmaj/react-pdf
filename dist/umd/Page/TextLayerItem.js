"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextLayerItemInternal = void 0;
exports["default"] = TextLayerItem;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _propTypes2 = require("../shared/propTypes");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var TextLayerItemInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(TextLayerItemInternal, _PureComponent);

  var _super = _createSuper(TextLayerItemInternal);

  function TextLayerItemInternal() {
    var _this;

    (0, _classCallCheck2["default"])(this, TextLayerItemInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "itemElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getElementWidth", function (element) {
      var _assertThisInitialize = (0, _assertThisInitialized2["default"])(_this),
          sideways = _assertThisInitialize.sideways;

      return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
    });
    return _this;
  }

  (0, _createClass2["default"])(TextLayerItemInternal, [{
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

      var _transform = (0, _slicedToArray2["default"])(transform, 2),
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

      var _transform2 = (0, _slicedToArray2["default"])(transform, 6),

      /* fontHeightPx */

      /* fontWidthPx */
      offsetX = _transform2[2],
          offsetY = _transform2[3],
          x = _transform2[4],
          y = _transform2[5];

      var _viewport$viewBox = (0, _slicedToArray2["default"])(viewport.viewBox, 4),

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

      var _transform3 = (0, _slicedToArray2["default"])(transform, 6),

      /* fontHeightPx */

      /* fontWidthPx */

      /* offsetX */

      /* offsetY */
      x = _transform3[4],
          y = _transform3[5];

      var _viewport$viewBox2 = (0, _slicedToArray2["default"])(viewport.viewBox, 1),
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
      return /*#__PURE__*/_react["default"].createElement("span", {
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
}(_react.PureComponent);

exports.TextLayerItemInternal = TextLayerItemInternal;
TextLayerItemInternal.propTypes = {
  customTextRenderer: _propTypes["default"].func,
  fontName: _propTypes["default"].string.isRequired,
  itemIndex: _propTypes["default"].number.isRequired,
  page: _propTypes2.isPage.isRequired,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number,
  str: _propTypes["default"].string.isRequired,
  transform: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired,
  width: _propTypes["default"].number.isRequired
};

function TextLayerItem(props) {
  return /*#__PURE__*/_react["default"].createElement(_PageContext["default"].Consumer, null, function (context) {
    return /*#__PURE__*/_react["default"].createElement(TextLayerItemInternal, (0, _extends2["default"])({}, context, props));
  });
}