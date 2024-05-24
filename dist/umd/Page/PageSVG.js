"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PageSVGInternal = void 0;
exports["default"] = PageSVG;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _tinyWarning = _interopRequireDefault(require("tiny-warning"));

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _utils = require("../shared/utils");

var _propTypes2 = require("../shared/propTypes");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PageSVGInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(PageSVGInternal, _PureComponent);

  var _super = _createSuper(PageSVGInternal);

  function PageSVGInternal() {
    var _this;

    (0, _classCallCheck2["default"])(this, PageSVGInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      svg: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onRenderSuccess", function () {
      _this.renderer = null;
      var _this$props = _this.props,
          onRenderSuccess = _this$props.onRenderSuccess,
          page = _this$props.page,
          scale = _this$props.scale;
      if (onRenderSuccess) onRenderSuccess((0, _utils.makePageCallback)(page, scale));
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onRenderError", function (error) {
      if ((0, _utils.isCancelException)(error)) {
        return;
      }

      (0, _tinyWarning["default"])(error);
      var onRenderError = _this.props.onRenderError;
      if (onRenderError) onRenderError(error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "renderSVG", function () {
      var page = _this.props.page;
      _this.renderer = page.getOperatorList();
      return _this.renderer.then(function (operatorList) {
        var svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
        _this.renderer = svgGfx.getSVG(operatorList, _this.viewport).then(function (svg) {
          _this.setState({
            svg: svg
          }, _this.onRenderSuccess);
        })["catch"](_this.onRenderError);
      })["catch"](_this.onRenderError);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "drawPageOnContainer", function (element) {
      var svg = _this.state.svg;

      if (!element || !svg) {
        return;
      } // Append SVG element to the main container, if this hasn't been done already


      if (!element.firstElementChild) {
        element.appendChild(svg);
      }

      var _this$viewport = _this.viewport,
          width = _this$viewport.width,
          height = _this$viewport.height;
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
    });
    return _this;
  }

  (0, _createClass2["default"])(PageSVGInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.renderSVG();
    }
    /**
     * Called when a page is rendered successfully.
     */

  }, {
    key: "viewport",
    get: function get() {
      var _this$props2 = this.props,
          page = _this$props2.page,
          rotate = _this$props2.rotate,
          scale = _this$props2.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$viewport2 = this.viewport,
          width = _this$viewport2.width,
          height = _this$viewport2.height;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "react-pdf__Page__svg" // Note: This cannot be shortened, as we need this function to be called with each render.
        ,
        ref: function ref(_ref) {
          return _this2.drawPageOnContainer(_ref);
        },
        style: {
          display: 'block',
          backgroundColor: 'white',
          overflow: 'hidden',
          width: width,
          height: height,
          userSelect: 'none'
        }
      });
    }
  }]);
  return PageSVGInternal;
}(_react.PureComponent);

exports.PageSVGInternal = PageSVGInternal;
PageSVGInternal.propTypes = {
  onRenderError: _propTypes["default"].func,
  onRenderSuccess: _propTypes["default"].func,
  page: _propTypes2.isPage.isRequired,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number.isRequired
};

function PageSVG(props) {
  return /*#__PURE__*/_react["default"].createElement(_PageContext["default"].Consumer, null, function (context) {
    return /*#__PURE__*/_react["default"].createElement(PageSVGInternal, (0, _extends2["default"])({}, context, props));
  });
}