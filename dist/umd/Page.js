"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PageInternal = void 0;

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

var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));

var _makeEventProps = _interopRequireDefault(require("make-event-props"));

var _mergeClassNames = _interopRequireDefault(require("merge-class-names"));

var _mergeRefs = _interopRequireDefault(require("merge-refs"));

var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));

var _tinyWarning = _interopRequireDefault(require("tiny-warning"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _PageContext = _interopRequireDefault(require("./PageContext"));

var _Message = _interopRequireDefault(require("./Message"));

var _PageCanvas = _interopRequireDefault(require("./Page/PageCanvas"));

var _PageSVG = _interopRequireDefault(require("./Page/PageSVG"));

var _TextLayer = _interopRequireDefault(require("./Page/TextLayer"));

var _AnnotationLayer = _interopRequireDefault(require("./Page/AnnotationLayer"));

var _utils = require("./shared/utils");

var _propTypes2 = require("./shared/propTypes");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var defaultScale = 1;

var PageInternal = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(PageInternal, _PureComponent);

  var _super = _createSuper(PageInternal);

  function PageInternal() {
    var _this;

    (0, _classCallCheck2["default"])(this, PageInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      page: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "pageElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadSuccess", function () {
      var _this$props = _this.props,
          onLoadSuccess = _this$props.onLoadSuccess,
          registerPage = _this$props.registerPage;
      var page = _this.state.page;
      if (onLoadSuccess) onLoadSuccess((0, _utils.makePageCallback)(page, _this.scale));
      if (registerPage) registerPage(_this.pageIndex, _this.pageElement.current);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadError", function (error) {
      _this.setState({
        page: false
      });

      (0, _tinyWarning["default"])(error);
      var onLoadError = _this.props.onLoadError;
      if (onLoadError) onLoadError(error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "loadPage", function () {
      var pdf = _this.props.pdf;

      var pageNumber = _this.getPageNumber();

      if (!pageNumber) {
        return;
      }

      _this.setState(function (prevState) {
        if (!prevState.page) {
          return null;
        }

        return {
          page: null
        };
      });

      var cancellable = (0, _makeCancellablePromise["default"])(pdf.getPage(pageNumber));
      _this.runningTask = cancellable;
      cancellable.promise.then(function (page) {
        _this.setState({
          page: page
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });
    return _this;
  }

  (0, _createClass2["default"])(PageInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var pdf = this.props.pdf;
      (0, _tinyInvariant["default"])(pdf, 'Attempted to load a page, but no document was specified.');
      this.loadPage();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var pdf = this.props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf || this.getPageNumber() !== this.getPageNumber(prevProps)) {
        var unregisterPage = this.props.unregisterPage;
        if (unregisterPage) unregisterPage(this.getPageIndex(prevProps));
        this.loadPage();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var unregisterPage = this.props.unregisterPage;
      if (unregisterPage) unregisterPage(this.pageIndex);
      (0, _utils.cancelRunningTask)(this.runningTask);
    }
  }, {
    key: "childContext",
    get: function get() {
      var page = this.state.page;

      if (!page) {
        return {};
      }

      var _this$props2 = this.props,
          canvasBackground = _this$props2.canvasBackground,
          customTextRenderer = _this$props2.customTextRenderer,
          onGetAnnotationsError = _this$props2.onGetAnnotationsError,
          onGetAnnotationsSuccess = _this$props2.onGetAnnotationsSuccess,
          onGetTextError = _this$props2.onGetTextError,
          onGetTextSuccess = _this$props2.onGetTextSuccess,
          onRenderAnnotationLayerError = _this$props2.onRenderAnnotationLayerError,
          onRenderAnnotationLayerSuccess = _this$props2.onRenderAnnotationLayerSuccess,
          onRenderError = _this$props2.onRenderError,
          onRenderSuccess = _this$props2.onRenderSuccess,
          renderForms = _this$props2.renderForms,
          renderInteractiveForms = _this$props2.renderInteractiveForms;
      return {
        canvasBackground: canvasBackground,
        customTextRenderer: customTextRenderer,
        onGetAnnotationsError: onGetAnnotationsError,
        onGetAnnotationsSuccess: onGetAnnotationsSuccess,
        onGetTextError: onGetTextError,
        onGetTextSuccess: onGetTextSuccess,
        onRenderAnnotationLayerError: onRenderAnnotationLayerError,
        onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
        onRenderError: onRenderError,
        onRenderSuccess: onRenderSuccess,
        page: page,
        renderForms: renderForms !== null && renderForms !== void 0 ? renderForms : renderInteractiveForms,
        // For backward compatibility
        rotate: this.rotate,
        scale: this.scale
      };
    }
    /**
     * Called when a page is loaded successfully
     */

  }, {
    key: "getPageIndex",
    value: function getPageIndex() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if ((0, _utils.isProvided)(props.pageNumber)) {
        return props.pageNumber - 1;
      }

      if ((0, _utils.isProvided)(props.pageIndex)) {
        return props.pageIndex;
      }

      return null;
    }
  }, {
    key: "getPageNumber",
    value: function getPageNumber() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if ((0, _utils.isProvided)(props.pageNumber)) {
        return props.pageNumber;
      }

      if ((0, _utils.isProvided)(props.pageIndex)) {
        return props.pageIndex + 1;
      }

      return null;
    }
  }, {
    key: "pageIndex",
    get: function get() {
      return this.getPageIndex();
    }
  }, {
    key: "pageNumber",
    get: function get() {
      return this.getPageNumber();
    }
  }, {
    key: "rotate",
    get: function get() {
      var rotate = this.props.rotate;

      if ((0, _utils.isProvided)(rotate)) {
        return rotate;
      }

      var page = this.state.page;

      if (!page) {
        return null;
      }

      return page.rotate;
    }
  }, {
    key: "scale",
    get: function get() {
      var page = this.state.page;

      if (!page) {
        return null;
      }

      var _this$props3 = this.props,
          scale = _this$props3.scale,
          width = _this$props3.width,
          height = _this$props3.height;
      var rotate = this.rotate; // Be default, we'll render page at 100% * scale width.

      var pageScale = 1; // Passing scale explicitly null would cause the page not to render

      var scaleWithDefault = scale === null ? defaultScale : scale; // If width/height is defined, calculate the scale of the page so it could be of desired width.

      if (width || height) {
        var viewport = page.getViewport({
          scale: 1,
          rotation: rotate
        });
        pageScale = width ? width / viewport.width : height / viewport.height;
      }

      return scaleWithDefault * pageScale;
    }
  }, {
    key: "eventProps",
    get: function get() {
      var _this2 = this;

      return (0, _makeEventProps["default"])(this.props, function () {
        var page = _this2.state.page;

        if (!page) {
          return page;
        }

        return (0, _utils.makePageCallback)(page, _this2.scale);
      });
    }
  }, {
    key: "pageKey",
    get: function get() {
      var page = this.state.page;
      return "".concat(page.pageIndex, "@").concat(this.scale, "/").concat(this.rotate);
    }
  }, {
    key: "pageKeyNoScale",
    get: function get() {
      var page = this.state.page;
      return "".concat(page.pageIndex, "/").concat(this.rotate);
    }
  }, {
    key: "renderMainLayer",
    value: function renderMainLayer() {
      var _this$props4 = this.props,
          canvasRef = _this$props4.canvasRef,
          renderMode = _this$props4.renderMode;

      switch (renderMode) {
        case 'none':
          return null;

        case 'svg':
          return /*#__PURE__*/_react["default"].createElement(_PageSVG["default"], {
            key: "".concat(this.pageKeyNoScale, "_svg")
          });

        case 'canvas':
        default:
          return /*#__PURE__*/_react["default"].createElement(_PageCanvas["default"], {
            key: "".concat(this.pageKey, "_canvas"),
            canvasRef: canvasRef
          });
      }
    }
  }, {
    key: "renderTextLayer",
    value: function renderTextLayer() {
      var renderTextLayer = this.props.renderTextLayer;

      if (!renderTextLayer) {
        return null;
      }

      return /*#__PURE__*/_react["default"].createElement(_TextLayer["default"], {
        key: "".concat(this.pageKey, "_text")
      });
    }
  }, {
    key: "renderAnnotationLayer",
    value: function renderAnnotationLayer() {
      var renderAnnotationLayer = this.props.renderAnnotationLayer;

      if (!renderAnnotationLayer) {
        return null;
      }
      /**
       * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
       * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
       */


      return /*#__PURE__*/_react["default"].createElement(_AnnotationLayer["default"], {
        key: "".concat(this.pageKey, "_annotations")
      });
    }
  }, {
    key: "renderChildren",
    value: function renderChildren() {
      var children = this.props.children;
      return /*#__PURE__*/_react["default"].createElement(_PageContext["default"].Provider, {
        value: this.childContext
      }, this.renderMainLayer(), this.renderTextLayer(), this.renderAnnotationLayer(), children);
    }
  }, {
    key: "renderContent",
    value: function renderContent() {
      var pageNumber = this.pageNumber;
      var pdf = this.props.pdf;
      var page = this.state.page;

      if (!pageNumber) {
        var noData = this.props.noData;
        return /*#__PURE__*/_react["default"].createElement(_Message["default"], {
          type: "no-data"
        }, typeof noData === 'function' ? noData() : noData);
      }

      if (pdf === null || page === null) {
        var loading = this.props.loading;
        return /*#__PURE__*/_react["default"].createElement(_Message["default"], {
          type: "loading"
        }, typeof loading === 'function' ? loading() : loading);
      }

      if (pdf === false || page === false) {
        var error = this.props.error;
        return /*#__PURE__*/_react["default"].createElement(_Message["default"], {
          type: "error"
        }, typeof error === 'function' ? error() : error);
      }

      return this.renderChildren();
    }
  }, {
    key: "render",
    value: function render() {
      var pageNumber = this.pageNumber;
      var _this$props5 = this.props,
          className = _this$props5.className,
          inputRef = _this$props5.inputRef;
      return /*#__PURE__*/_react["default"].createElement("div", (0, _extends2["default"])({
        className: (0, _mergeClassNames["default"])('react-pdf__Page', className),
        "data-page-number": pageNumber,
        ref: (0, _mergeRefs["default"])(inputRef, this.pageElement),
        style: {
          position: 'relative'
        }
      }, this.eventProps), this.renderContent());
    }
  }]);
  return PageInternal;
}(_react.PureComponent);

exports.PageInternal = PageInternal;
PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotationLayer: true,
  renderForms: false,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: defaultScale
};

var isFunctionOrNode = _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].node]);

PageInternal.propTypes = _objectSpread(_objectSpread({}, _propTypes2.eventProps), {}, {
  canvasBackground: _propTypes["default"].string,
  children: _propTypes["default"].node,
  className: _propTypes2.isClassName,
  customTextRenderer: _propTypes["default"].func,
  error: isFunctionOrNode,
  height: _propTypes["default"].number,
  imageResourcesPath: _propTypes["default"].string,
  inputRef: _propTypes2.isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onGetTextError: _propTypes["default"].func,
  onGetTextSuccess: _propTypes["default"].func,
  onLoadError: _propTypes["default"].func,
  onLoadSuccess: _propTypes["default"].func,
  onRenderError: _propTypes["default"].func,
  onRenderSuccess: _propTypes["default"].func,
  pageIndex: _propTypes2.isPageIndex,
  pageNumber: _propTypes2.isPageNumber,
  pdf: _propTypes2.isPdf,
  registerPage: _propTypes["default"].func,
  renderAnnotationLayer: _propTypes["default"].bool,
  renderForms: _propTypes["default"].bool,
  renderInteractiveForms: _propTypes["default"].bool,
  // For backward compatibility
  renderMode: _propTypes2.isRenderMode,
  renderTextLayer: _propTypes["default"].bool,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number,
  unregisterPage: _propTypes["default"].func,
  width: _propTypes["default"].number
});

function Page(props, ref) {
  return /*#__PURE__*/_react["default"].createElement(_DocumentContext["default"].Consumer, null, function (context) {
    return /*#__PURE__*/_react["default"].createElement(PageInternal, (0, _extends2["default"])({
      ref: ref
    }, context, props));
  });
}

var _default = /*#__PURE__*/_react["default"].forwardRef(Page);

exports["default"] = _default;