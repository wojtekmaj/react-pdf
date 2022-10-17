"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof3 = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _makeEventProps = _interopRequireDefault(require("make-event-props"));
var _makeCancellablePromise = _interopRequireDefault(require("make-cancellable-promise"));
var _mergeClassNames = _interopRequireDefault(require("merge-class-names"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _tinyWarning = _interopRequireDefault(require("tiny-warning"));
var pdfjs = _interopRequireWildcard(require("pdfjs-dist/build/pdf"));
var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));
var _Message = _interopRequireDefault(require("./Message"));
var _LinkService = _interopRequireDefault(require("./LinkService"));
var _PasswordResponses = _interopRequireDefault(require("./PasswordResponses"));
var _utils = require("./shared/utils");
var _propTypes2 = require("./shared/propTypes");
var _excluded = ["url"];
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof3(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var PDFDataRangeTransport = pdfjs.PDFDataRangeTransport;
var Document = /*#__PURE__*/function (_PureComponent) {
  (0, _inherits2["default"])(Document, _PureComponent);
  var _super = _createSuper(Document);
  function Document() {
    var _this;
    (0, _classCallCheck2["default"])(this, Document);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      pdf: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "viewer", {
      scrollPageIntoView: function scrollPageIntoView(_ref) {
        var dest = _ref.dest,
          pageIndex = _ref.pageIndex,
          pageNumber = _ref.pageNumber;
        // Handling jumping to internal links target
        var onItemClick = _this.props.onItemClick;

        // First, check if custom handling of onItemClick was provided
        if (onItemClick) {
          onItemClick({
            dest: dest,
            pageIndex: pageIndex,
            pageNumber: pageNumber
          });
          return;
        }

        // If not, try to look for target page within the <Document>.
        var page = _this.pages[pageIndex];
        if (page) {
          // Scroll to the page automatically
          page.scrollIntoView();
          return;
        }
        (0, _tinyWarning["default"])(false, "An internal link leading to page ".concat(pageNumber, " was clicked, but neither <Document> was provided with onItemClick nor it was able to find the page within itself. Either provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>."));
      }
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "linkService", new _LinkService["default"]());
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "loadDocument", function () {
      // If another rendering is in progress, let's cancel it
      (0, _utils.cancelRunningTask)(_this.runningTask);

      // If another loading is in progress, let's destroy it
      if (_this.loadingTask) _this.loadingTask.destroy();
      var cancellable = (0, _makeCancellablePromise["default"])(_this.findDocumentSource());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (source) {
        _this.onSourceSuccess();
        if (!source) {
          return;
        }
        _this.setState(function (prevState) {
          if (!prevState.pdf) {
            return null;
          }
          return {
            pdf: null
          };
        });
        var _this$props = _this.props,
          options = _this$props.options,
          onLoadProgress = _this$props.onLoadProgress,
          onPassword = _this$props.onPassword;
        _this.loadingTask = pdfjs.getDocument(_objectSpread(_objectSpread({}, source), options));
        _this.loadingTask.onPassword = onPassword;
        if (onLoadProgress) {
          _this.loadingTask.onProgress = onLoadProgress;
        }
        var cancellable = (0, _makeCancellablePromise["default"])(_this.loadingTask.promise);
        _this.runningTask = cancellable;
        cancellable.promise.then(function (pdf) {
          _this.setState(function (prevState) {
            if (prevState.pdf && prevState.pdf.fingerprint === pdf.fingerprint) {
              return null;
            }
            return {
              pdf: pdf
            };
          }, _this.onLoadSuccess);
        })["catch"](function (error) {
          _this.onLoadError(error);
        });
      })["catch"](function (error) {
        _this.onSourceError(error);
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setupLinkService", function () {
      var _this$props2 = _this.props,
        externalLinkRel = _this$props2.externalLinkRel,
        externalLinkTarget = _this$props2.externalLinkTarget;
      _this.linkService.setViewer(_this.viewer);
      _this.linkService.setExternalLinkRel(externalLinkRel);
      _this.linkService.setExternalLinkTarget(externalLinkTarget);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onSourceSuccess", function () {
      var onSourceSuccess = _this.props.onSourceSuccess;
      if (onSourceSuccess) onSourceSuccess();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onSourceError", function (error) {
      (0, _tinyWarning["default"])(error);
      var onSourceError = _this.props.onSourceError;
      if (onSourceError) onSourceError(error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadSuccess", function () {
      var onLoadSuccess = _this.props.onLoadSuccess;
      var pdf = _this.state.pdf;
      if (onLoadSuccess) onLoadSuccess(pdf);
      _this.pages = new Array(pdf.numPages);
      _this.linkService.setDocument(pdf);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onLoadError", function (error) {
      _this.setState({
        pdf: false
      });
      (0, _tinyWarning["default"])(error);
      var onLoadError = _this.props.onLoadError;
      if (onLoadError) onLoadError(error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "findDocumentSource", function () {
      return new Promise(function (resolve) {
        var file = _this.props.file;
        if (!file) {
          resolve(null);
        }

        // File is a string
        if (typeof file === 'string') {
          if ((0, _utils.isDataURI)(file)) {
            var fileByteString = (0, _utils.dataURItoByteString)(file);
            resolve({
              data: fileByteString
            });
          }
          (0, _utils.displayCORSWarning)();
          resolve({
            url: file
          });
        }

        // File is PDFDataRangeTransport
        if (file instanceof PDFDataRangeTransport) {
          resolve({
            range: file
          });
        }

        // File is an ArrayBuffer
        if ((0, _utils.isArrayBuffer)(file)) {
          resolve({
            data: file
          });
        }

        /**
         * The cases below are browser-only.
         * If you're running on a non-browser environment, these cases will be of no use.
         */
        if (_utils.isBrowser) {
          // File is a Blob
          if ((0, _utils.isBlob)(file) || (0, _utils.isFile)(file)) {
            (0, _utils.loadFromFile)(file).then(function (data) {
              resolve({
                data: data
              });
            });
            return;
          }
        }

        // At this point, file must be an object
        (0, _tinyInvariant["default"])((0, _typeof2["default"])(file) === 'object', 'Invalid parameter in file, need either Uint8Array, string or a parameter object');
        (0, _tinyInvariant["default"])(file.url || file.data || file.range, 'Invalid parameter object: need either .data, .range or .url');

        // File .url is a string
        if (typeof file.url === 'string') {
          if ((0, _utils.isDataURI)(file.url)) {
            var url = file.url,
              otherParams = (0, _objectWithoutProperties2["default"])(file, _excluded);
            var _fileByteString = (0, _utils.dataURItoByteString)(url);
            resolve(_objectSpread({
              data: _fileByteString
            }, otherParams));
          }
          (0, _utils.displayCORSWarning)();
        }
        resolve(file);
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "registerPage", function (pageIndex, ref) {
      _this.pages[pageIndex] = ref;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "unregisterPage", function (pageIndex) {
      delete _this.pages[pageIndex];
    });
    return _this;
  }
  (0, _createClass2["default"])(Document, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.loadDocument();
      this.setupLinkService();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var file = this.props.file;
      if (file !== prevProps.file) {
        this.loadDocument();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // If rendering is in progress, let's cancel it
      (0, _utils.cancelRunningTask)(this.runningTask);

      // If loading is in progress, let's destroy it
      if (this.loadingTask) this.loadingTask.destroy();
    }
  }, {
    key: "childContext",
    get: function get() {
      var linkService = this.linkService,
        registerPage = this.registerPage,
        unregisterPage = this.unregisterPage;
      var _this$props3 = this.props,
        imageResourcesPath = _this$props3.imageResourcesPath,
        renderMode = _this$props3.renderMode,
        rotate = _this$props3.rotate;
      var pdf = this.state.pdf;
      return {
        imageResourcesPath: imageResourcesPath,
        linkService: linkService,
        pdf: pdf,
        registerPage: registerPage,
        renderMode: renderMode,
        rotate: rotate,
        unregisterPage: unregisterPage
      };
    }
  }, {
    key: "eventProps",
    get: function get() {
      var _this2 = this;
      return (0, _makeEventProps["default"])(this.props, function () {
        return _this2.state.pdf;
      });
    }

    /**
     * Called when a document source is resolved correctly
     */
  }, {
    key: "renderChildren",
    value: function renderChildren() {
      var children = this.props.children;
      return /*#__PURE__*/_react["default"].createElement(_DocumentContext["default"].Provider, {
        value: this.childContext
      }, children);
    }
  }, {
    key: "renderContent",
    value: function renderContent() {
      var file = this.props.file;
      var pdf = this.state.pdf;
      if (!file) {
        var noData = this.props.noData;
        return /*#__PURE__*/_react["default"].createElement(_Message["default"], {
          type: "no-data"
        }, typeof noData === 'function' ? noData() : noData);
      }
      if (pdf === null) {
        var loading = this.props.loading;
        return /*#__PURE__*/_react["default"].createElement(_Message["default"], {
          type: "loading"
        }, typeof loading === 'function' ? loading() : loading);
      }
      if (pdf === false) {
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
      var _this$props4 = this.props,
        className = _this$props4.className,
        inputRef = _this$props4.inputRef;
      return /*#__PURE__*/_react["default"].createElement("div", (0, _extends2["default"])({
        className: (0, _mergeClassNames["default"])('react-pdf__Document', className),
        ref: inputRef
      }, this.eventProps), this.renderContent());
    }
  }]);
  return Document;
}(_react.PureComponent);
exports["default"] = Document;
Document.defaultProps = {
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.',
  onPassword: function onPassword(callback, reason) {
    switch (reason) {
      case _PasswordResponses["default"].NEED_PASSWORD:
        {
          // eslint-disable-next-line no-alert
          var password = prompt('Enter the password to open this PDF file.');
          callback(password);
          break;
        }
      case _PasswordResponses["default"].INCORRECT_PASSWORD:
        {
          // eslint-disable-next-line no-alert
          var _password = prompt('Invalid password. Please try again.');
          callback(_password);
          break;
        }
      default:
    }
  }
};
var isFunctionOrNode = _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].node]);
Document.propTypes = _objectSpread(_objectSpread({}, _propTypes2.eventProps), {}, {
  children: _propTypes["default"].node,
  className: _propTypes2.isClassName,
  error: isFunctionOrNode,
  externalLinkRel: _propTypes["default"].string,
  externalLinkTarget: _propTypes["default"].string,
  file: _propTypes2.isFile,
  imageResourcesPath: _propTypes["default"].string,
  inputRef: _propTypes2.isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onItemClick: _propTypes["default"].func,
  onLoadError: _propTypes["default"].func,
  onLoadProgress: _propTypes["default"].func,
  onLoadSuccess: _propTypes["default"].func,
  onPassword: _propTypes["default"].func,
  onSourceError: _propTypes["default"].func,
  onSourceSuccess: _propTypes["default"].func,
  rotate: _propTypes["default"].number
});