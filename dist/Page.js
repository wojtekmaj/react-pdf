"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PageInternal = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _makeEventProps = _interopRequireDefault(require("make-event-props"));

var _mergeClassNames = _interopRequireDefault(require("merge-class-names"));

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _PageContext = _interopRequireDefault(require("./PageContext"));

var _Message = _interopRequireDefault(require("./Message"));

var _PageCanvas = _interopRequireDefault(require("./Page/PageCanvas"));

var _PageSVG = _interopRequireDefault(require("./Page/PageSVG"));

var _TextLayer = _interopRequireDefault(require("./Page/TextLayer"));

var _AnnotationLayer = _interopRequireDefault(require("./Page/AnnotationLayer"));

var _utils = require("./shared/utils");

var _propTypes2 = require("./shared/propTypes");

var defaultScale = 1.0;

var PageInternal =
/*#__PURE__*/
function (_PureComponent) {
  (0, _inherits2["default"])(PageInternal, _PureComponent);

  function PageInternal() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, PageInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(PageInternal)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      page: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadSuccess", function () {
      var _this$props = _this.props,
          onLoadSuccess = _this$props.onLoadSuccess,
          registerPage = _this$props.registerPage;
      var page = _this.state.page;
      (0, _utils.callIfDefined)(onLoadSuccess, (0, _utils.makePageCallback)(page, _this.scale));
      (0, _utils.callIfDefined)(registerPage, _this.pageIndex, _this.ref);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadError", function (error) {
      if ((0, _utils.isCancelException)(error)) {
        return;
      }

      (0, _utils.errorOnDev)(error);
      var onLoadError = _this.props.onLoadError;
      (0, _utils.callIfDefined)(onLoadError, error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "loadPage",
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      var pdf, pageNumber, cancellable, page;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              pdf = _this.props.pdf;
              pageNumber = _this.getPageNumber();

              if (pageNumber) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return");

            case 4:
              _this.setState(function (prevState) {
                if (!prevState.page) {
                  return null;
                }

                return {
                  page: null
                };
              });

              _context.prev = 5;
              cancellable = (0, _utils.makeCancellable)(pdf.getPage(pageNumber));
              _this.runningTask = cancellable;
              _context.next = 10;
              return cancellable.promise;

            case 10:
              page = _context.sent;

              _this.setState({
                page: page
              }, _this.onLoadSuccess);

              _context.next = 18;
              break;

            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](5);

              _this.setState({
                page: false
              });

              _this.onLoadError(_context.t0);

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 14]]);
    })));
    return _this;
  }

  (0, _createClass2["default"])(PageInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var pdf = this.props.pdf;

      if (!pdf) {
        throw new Error('Attempted to load a page, but no document was specified.');
      }

      this.loadPage();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var pdf = this.props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf || this.getPageNumber() !== this.getPageNumber(prevProps)) {
        var unregisterPage = this.props.unregisterPage;
        (0, _utils.callIfDefined)(unregisterPage, this.getPageIndex(prevProps));
        this.loadPage();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var unregisterPage = this.props.unregisterPage;
      (0, _utils.callIfDefined)(unregisterPage, this.pageIndex);
      (0, _utils.cancelRunningTask)(this.runningTask);
    }
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
    key: "renderMainLayer",
    value: function renderMainLayer() {
      var renderMode = this.props.renderMode;

      switch (renderMode) {
        case 'none':
          return null;

        case 'svg':
          return _react["default"].createElement(_PageSVG["default"], {
            key: "".concat(this.pageKeyNoScale, "_svg")
          });

        case 'canvas':
        default:
          return _react["default"].createElement(_PageCanvas["default"], {
            key: "".concat(this.pageKey, "_canvas")
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

      return _react["default"].createElement(_TextLayer["default"], {
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


      return _react["default"].createElement(_AnnotationLayer["default"], {
        key: "".concat(this.pageKey, "_annotations")
      });
    }
  }, {
    key: "renderChildren",
    value: function renderChildren() {
      var children = this.props.children;
      return _react["default"].createElement(_PageContext["default"].Provider, {
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
        return _react["default"].createElement(_Message["default"], {
          type: "no-data"
        }, typeof noData === 'function' ? noData() : noData);
      }

      if (pdf === null || page === null) {
        var loading = this.props.loading;
        return _react["default"].createElement(_Message["default"], {
          type: "loading"
        }, typeof loading === 'function' ? loading() : loading);
      }

      if (pdf === false || page === false) {
        var error = this.props.error;
        return _react["default"].createElement(_Message["default"], {
          type: "error"
        }, typeof error === 'function' ? error() : error);
      }

      return this.renderChildren();
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var pageNumber = this.pageNumber;
      var className = this.props.className;
      return _react["default"].createElement("div", (0, _extends2["default"])({
        className: (0, _mergeClassNames["default"])('react-pdf__Page', className),
        ref: function ref(_ref2) {
          var inputRef = _this2.props.inputRef;

          if (inputRef) {
            inputRef(_ref2);
          }

          _this2.ref = _ref2;
        },
        style: {
          position: 'relative'
        },
        "data-page-number": pageNumber
      }, this.eventProps), this.renderContent());
    }
  }, {
    key: "childContext",
    get: function get() {
      var page = this.state.page;

      if (!page) {
        return {};
      }

      var _this$props2 = this.props,
          customTextRenderer = _this$props2.customTextRenderer,
          textItemFilter = _this$props2.textItemFilter,
          onGetAnnotationsError = _this$props2.onGetAnnotationsError,
          onGetAnnotationsSuccess = _this$props2.onGetAnnotationsSuccess,
          onGetTextError = _this$props2.onGetTextError,
          onGetTextSuccess = _this$props2.onGetTextSuccess,
          onRenderAnnotationLayerError = _this$props2.onRenderAnnotationLayerError,
          onRenderAnnotationLayerSuccess = _this$props2.onRenderAnnotationLayerSuccess,
          onRenderError = _this$props2.onRenderError,
          onRenderSuccess = _this$props2.onRenderSuccess,
          renderInteractiveForms = _this$props2.renderInteractiveForms;
      return {
        customTextRenderer: customTextRenderer,
        textItemFilter: textItemFilter,
        onGetAnnotationsError: onGetAnnotationsError,
        onGetAnnotationsSuccess: onGetAnnotationsSuccess,
        onGetTextError: onGetTextError,
        onGetTextSuccess: onGetTextSuccess,
        onRenderAnnotationLayerError: onRenderAnnotationLayerError,
        onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
        onRenderError: onRenderError,
        onRenderSuccess: onRenderSuccess,
        page: page,
        renderInteractiveForms: renderInteractiveForms,
        rotate: this.rotate,
        scale: this.scale
      };
    }
    /**
     * Called when a page is loaded successfully
     */

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
      var _this3 = this;

      return (0, _makeEventProps["default"])(this.props, function () {
        var page = _this3.state.page;

        if (!page) {
          return page;
        }

        return (0, _utils.makePageCallback)(page, _this3.scale);
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
  }]);
  return PageInternal;
}(_react.PureComponent);

exports.PageInternal = PageInternal;
PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotationLayer: true,
  renderInteractiveForms: false,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: defaultScale
};
PageInternal.propTypes = (0, _objectSpread2["default"])({
  children: _propTypes["default"].node,
  className: _propTypes2.isClassName,
  customTextRenderer: _propTypes["default"].func,
  error: _propTypes["default"].node,
  height: _propTypes["default"].number,
  inputRef: _propTypes["default"].func,
  loading: _propTypes["default"].node,
  noData: _propTypes["default"].node,
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
  renderInteractiveForms: _propTypes["default"].bool,
  renderMode: _propTypes2.isRenderMode,
  renderTextLayer: _propTypes["default"].bool,
  rotate: _propTypes2.isRotate,
  scale: _propTypes["default"].number,
  unregisterPage: _propTypes["default"].func,
  width: _propTypes["default"].number
}, (0, _propTypes2.eventsProps)());

var Page = function Page(props) {
  return _react["default"].createElement(_DocumentContext["default"].Consumer, null, function (context) {
    return _react["default"].createElement(PageInternal, (0, _extends2["default"])({}, context, props, {
      // For backwards compatibility
      renderAnnotationLayer: typeof props.renderAnnotationLayer !== 'undefined' ? props.renderAnnotationLayer : props.renderAnnotations
    }));
  });
};

Page.propTypes = {
  renderAnnotationLayer: _propTypes["default"].bool,
  renderAnnotations: _propTypes["default"].bool
};
var _default = Page;
exports["default"] = _default;