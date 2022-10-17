"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextLayerInternal = void 0;
exports["default"] = TextLayer;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = _interopRequireWildcard(require("react"));
var _server = require("react-dom/server");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _tinyWarning = _interopRequireDefault(require("tiny-warning"));
var pdfjs = _interopRequireWildcard(require("pdfjs-dist/build/pdf"));
var _PageContext = _interopRequireDefault(require("../PageContext"));
var _utils = require("../shared/utils");
var _propTypes2 = require("../shared/propTypes");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var TextLayerInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(TextLayerInternal, _PureComponent);
  var _super = _createSuper(TextLayerInternal);
  function TextLayerInternal() {
    var _this;
    (0, _classCallCheck2["default"])(this, TextLayerInternal);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      textContent: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "layerElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "loadTextContent", function () {
      var page = _this.props.page;
      var cancellable = (0, _makeCancellablePromise["default"])(page.getTextContent());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (textContent) {
        _this.setState({
          textContent: textContent
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadSuccess", function () {
      var onGetTextSuccess = _this.props.onGetTextSuccess;
      var textContent = _this.state.textContent;
      if (onGetTextSuccess) onGetTextSuccess(textContent);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadError", function (error) {
      _this.setState({
        textItems: false
      });
      (0, _tinyWarning["default"])(error);
      var onGetTextError = _this.props.onGetTextError;
      if (onGetTextError) onGetTextError(error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onRenderSuccess", function () {
      var onRenderTextLayerSuccess = _this.props.onRenderTextLayerSuccess;
      if (onRenderTextLayerSuccess) onRenderTextLayerSuccess();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onRenderError", function (error) {
      (0, _tinyWarning["default"])(error);
      var onRenderTextLayerError = _this.props.onRenderTextLayerError;
      if (onRenderTextLayerError) onRenderTextLayerError(error);
    });
    return _this;
  }
  (0, _createClass2["default"])(TextLayerInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var page = this.props.page;
      (0, _tinyInvariant["default"])(page, 'Attempted to load page text content, but no page was specified.');
      (0, _tinyWarning["default"])(parseInt(window.getComputedStyle(document.body).getPropertyValue('--react-pdf-text-layer'), 10) === 1, 'TextLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-text-layer');
      this.loadTextContent();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var page = this.props.page;
      if (prevProps.page && page !== prevProps.page) {
        this.loadTextContent();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      (0, _utils.cancelRunningTask)(this.runningTask);
    }
  }, {
    key: "viewport",
    get: function get() {
      var _this$props = this.props,
        page = _this$props.page,
        rotate = _this$props.rotate,
        scale = _this$props.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "unrotatedViewport",
    get: function get() {
      var _this$props2 = this.props,
        page = _this$props2.page,
        scale = _this$props2.scale;
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
      var _this$props3 = this.props,
        page = _this$props3.page,
        rotate = _this$props3.rotate;
      return rotate - page.rotate;
    }
  }, {
    key: "renderTextLayer",
    value: function renderTextLayer() {
      var _this2 = this;
      var textContent = this.state.textContent;
      if (!textContent) {
        return null;
      }
      var viewport = this.viewport;
      var customTextRenderer = this.props.customTextRenderer;

      // If another rendering is in progress, let's cancel it
      (0, _utils.cancelRunningTask)(this.runningTask);
      var parameters = {
        container: this.layerElement.current,
        textContent: textContent,
        viewport: viewport
      };
      this.layerElement.current.innerHTML = '';
      this.runningTask = pdfjs.renderTextLayer(parameters);
      var cancellable = (0, _makeCancellablePromise["default"])(this.runningTask.promise);
      this.runningTask = cancellable;
      cancellable.promise.then(function () {
        if (customTextRenderer) {
          Array.from(_this2.layerElement.current.children).forEach(function (element, elementIndex) {
            var reactContent = customTextRenderer(_objectSpread({
              itemIndex: elementIndex
            }, textContent.items[elementIndex]));
            element.innerHTML = (0, _server.renderToStaticMarkup)(reactContent);
          });
        }
        _this2.onRenderSuccess();
      })["catch"](function (error) {
        _this2.onRenderError(error);
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "react-pdf__Page__textContent textLayer",
        ref: this.layerElement
      }, this.renderTextLayer());
    }
  }]);
  return TextLayerInternal;
}(_react.PureComponent);
exports.TextLayerInternal = TextLayerInternal;
TextLayerInternal.propTypes = {
  customTextRenderer: _propTypes["default"].func,
  onGetTextError: _propTypes["default"].func,
  onGetTextSuccess: _propTypes["default"].func,
  onRenderTextLayerError: _propTypes["default"].func,
  onRenderTextLayerSuccess: _propTypes["default"].func,
  page: _propTypes2.isPage.isRequired,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number
};
function TextLayer(props) {
  return /*#__PURE__*/_react["default"].createElement(_PageContext["default"].Consumer, null, function (context) {
    return /*#__PURE__*/_react["default"].createElement(TextLayerInternal, (0, _extends2["default"])({}, context, props));
  });
}