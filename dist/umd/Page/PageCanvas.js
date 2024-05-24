"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PageCanvasInternal = void 0;
exports["default"] = PageCanvas;

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

var _mergeRefs = _interopRequireDefault(require("merge-refs"));

var _tinyWarning = _interopRequireDefault(require("tiny-warning"));

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

var _PageContext = _interopRequireDefault(require("../PageContext"));

var _utils = require("../shared/utils");

var _propTypes2 = require("../shared/propTypes");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ANNOTATION_MODE = pdfjs.AnnotationMode;

var PageCanvasInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(PageCanvasInternal, _PureComponent);

  var _super = _createSuper(PageCanvasInternal);

  function PageCanvasInternal() {
    var _this;

    (0, _classCallCheck2["default"])(this, PageCanvasInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "canvasElement", /*#__PURE__*/(0, _react.createRef)());
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "drawPageOnCanvas", function () {
      var canvas = _this.canvasElement.current;

      if (!canvas) {
        return null;
      }

      var _assertThisInitialize = (0, _assertThisInitialized2["default"])(_this),
          renderViewport = _assertThisInitialize.renderViewport,
          viewport = _assertThisInitialize.viewport;

      var _this$props2 = _this.props,
          canvasBackground = _this$props2.canvasBackground,
          page = _this$props2.page,
          renderForms = _this$props2.renderForms;
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      canvas.style.width = "".concat(Math.floor(viewport.width), "px");
      canvas.style.height = "".concat(Math.floor(viewport.height), "px");
      var renderContext = {
        annotationMode: renderForms ? ANNOTATION_MODE.ENABLE_FORMS : ANNOTATION_MODE.ENABLE,

        get canvasContext() {
          return canvas.getContext('2d');
        },

        viewport: renderViewport
      };

      if (canvasBackground) {
        renderContext.background = canvasBackground;
      } // If another render is in progress, let's cancel it


      _this.cancelRenderingTask();

      _this.renderer = page.render(renderContext);
      return _this.renderer.promise.then(_this.onRenderSuccess)["catch"](_this.onRenderError);
    });
    return _this;
  }

  (0, _createClass2["default"])(PageCanvasInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.drawPageOnCanvas();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props3 = this.props,
          canvasBackground = _this$props3.canvasBackground,
          page = _this$props3.page,
          renderForms = _this$props3.renderForms;

      if (canvasBackground !== prevProps.canvasBackground || renderForms !== prevProps.renderForms) {
        // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
        page.cleanup();
        this.drawPageOnCanvas();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.cancelRenderingTask();
      var canvas = this.canvasElement.current;
      /**
       * Zeroing the width and height cause most browsers to release graphics
       * resources immediately, which can greatly reduce memory consumption.
       */

      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  }, {
    key: "cancelRenderingTask",
    value: function cancelRenderingTask() {
      if (this.renderer) {
        this.renderer.cancel();
        this.renderer = null;
      }
    }
    /**
     * Called when a page is rendered successfully.
     */

  }, {
    key: "renderViewport",
    get: function get() {
      var _this$props4 = this.props,
          page = _this$props4.page,
          rotate = _this$props4.rotate,
          scale = _this$props4.scale;
      var pixelRatio = (0, _utils.getPixelRatio)();
      return page.getViewport({
        scale: scale * pixelRatio,
        rotation: rotate
      });
    }
  }, {
    key: "viewport",
    get: function get() {
      var _this$props5 = this.props,
          page = _this$props5.page,
          rotate = _this$props5.rotate,
          scale = _this$props5.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "render",
    value: function render() {
      var canvasRef = this.props.canvasRef;
      return /*#__PURE__*/_react["default"].createElement("canvas", {
        className: "react-pdf__Page__canvas",
        dir: "ltr",
        ref: (0, _mergeRefs["default"])(canvasRef, this.canvasElement),
        style: {
          display: 'block',
          userSelect: 'none'
        }
      });
    }
  }]);
  return PageCanvasInternal;
}(_react.PureComponent);

exports.PageCanvasInternal = PageCanvasInternal;
PageCanvasInternal.propTypes = {
  canvasBackground: _propTypes["default"].string,
  canvasRef: _propTypes2.isRef,
  onRenderError: _propTypes["default"].func,
  onRenderSuccess: _propTypes["default"].func,
  page: _propTypes2.isPage.isRequired,
  renderForms: _propTypes["default"].bool,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number.isRequired
};

function PageCanvas(props) {
  return /*#__PURE__*/_react["default"].createElement(_PageContext["default"].Consumer, null, function (context) {
    return /*#__PURE__*/_react["default"].createElement(PageCanvasInternal, (0, _extends2["default"])({}, context, props));
  });
}