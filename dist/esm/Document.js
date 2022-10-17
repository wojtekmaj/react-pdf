import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _typeof from "@babel/runtime/helpers/esm/typeof";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
var _excluded = ["url"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import makeCancellable from 'make-cancellable-promise';
import mergeClassNames from 'merge-class-names';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import DocumentContext from './DocumentContext';
import Message from './Message';
import LinkService from './LinkService';
import PasswordResponses from './PasswordResponses';
import { cancelRunningTask, dataURItoByteString, displayCORSWarning, isArrayBuffer, isBlob, isBrowser, isDataURI, isFile, loadFromFile } from './shared/utils';
import { eventProps, isClassName, isFile as isFileProp, isRef } from './shared/propTypes';
var PDFDataRangeTransport = pdfjs.PDFDataRangeTransport;
var Document = /*#__PURE__*/function (_PureComponent) {
  _inherits(Document, _PureComponent);
  var _super = _createSuper(Document);
  function Document() {
    var _this;
    _classCallCheck(this, Document);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "state", {
      pdf: null
    });
    _defineProperty(_assertThisInitialized(_this), "viewer", {
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
        warning(false, "An internal link leading to page ".concat(pageNumber, " was clicked, but neither <Document> was provided with onItemClick nor it was able to find the page within itself. Either provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>."));
      }
    });
    _defineProperty(_assertThisInitialized(_this), "linkService", new LinkService());
    _defineProperty(_assertThisInitialized(_this), "loadDocument", function () {
      // If another rendering is in progress, let's cancel it
      cancelRunningTask(_this.runningTask);

      // If another loading is in progress, let's destroy it
      if (_this.loadingTask) _this.loadingTask.destroy();
      var cancellable = makeCancellable(_this.findDocumentSource());
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
        var cancellable = makeCancellable(_this.loadingTask.promise);
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
    _defineProperty(_assertThisInitialized(_this), "setupLinkService", function () {
      var _this$props2 = _this.props,
        externalLinkRel = _this$props2.externalLinkRel,
        externalLinkTarget = _this$props2.externalLinkTarget;
      _this.linkService.setViewer(_this.viewer);
      _this.linkService.setExternalLinkRel(externalLinkRel);
      _this.linkService.setExternalLinkTarget(externalLinkTarget);
    });
    _defineProperty(_assertThisInitialized(_this), "onSourceSuccess", function () {
      var onSourceSuccess = _this.props.onSourceSuccess;
      if (onSourceSuccess) onSourceSuccess();
    });
    _defineProperty(_assertThisInitialized(_this), "onSourceError", function (error) {
      warning(error);
      var onSourceError = _this.props.onSourceError;
      if (onSourceError) onSourceError(error);
    });
    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var onLoadSuccess = _this.props.onLoadSuccess;
      var pdf = _this.state.pdf;
      if (onLoadSuccess) onLoadSuccess(pdf);
      _this.pages = new Array(pdf.numPages);
      _this.linkService.setDocument(pdf);
    });
    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        pdf: false
      });
      warning(error);
      var onLoadError = _this.props.onLoadError;
      if (onLoadError) onLoadError(error);
    });
    _defineProperty(_assertThisInitialized(_this), "findDocumentSource", function () {
      return new Promise(function (resolve) {
        var file = _this.props.file;
        if (!file) {
          resolve(null);
        }

        // File is a string
        if (typeof file === 'string') {
          if (isDataURI(file)) {
            var fileByteString = dataURItoByteString(file);
            resolve({
              data: fileByteString
            });
          }
          displayCORSWarning();
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
        if (isArrayBuffer(file)) {
          resolve({
            data: file
          });
        }

        /**
         * The cases below are browser-only.
         * If you're running on a non-browser environment, these cases will be of no use.
         */
        if (isBrowser) {
          // File is a Blob
          if (isBlob(file) || isFile(file)) {
            loadFromFile(file).then(function (data) {
              resolve({
                data: data
              });
            });
            return;
          }
        }

        // At this point, file must be an object
        invariant(_typeof(file) === 'object', 'Invalid parameter in file, need either Uint8Array, string or a parameter object');
        invariant(file.url || file.data || file.range, 'Invalid parameter object: need either .data, .range or .url');

        // File .url is a string
        if (typeof file.url === 'string') {
          if (isDataURI(file.url)) {
            var url = file.url,
              otherParams = _objectWithoutProperties(file, _excluded);
            var _fileByteString = dataURItoByteString(url);
            resolve(_objectSpread({
              data: _fileByteString
            }, otherParams));
          }
          displayCORSWarning();
        }
        resolve(file);
      });
    });
    _defineProperty(_assertThisInitialized(_this), "registerPage", function (pageIndex, ref) {
      _this.pages[pageIndex] = ref;
    });
    _defineProperty(_assertThisInitialized(_this), "unregisterPage", function (pageIndex) {
      delete _this.pages[pageIndex];
    });
    return _this;
  }
  _createClass(Document, [{
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
      cancelRunningTask(this.runningTask);

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
      return makeEventProps(this.props, function () {
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
      return /*#__PURE__*/React.createElement(DocumentContext.Provider, {
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
        return /*#__PURE__*/React.createElement(Message, {
          type: "no-data"
        }, typeof noData === 'function' ? noData() : noData);
      }
      if (pdf === null) {
        var loading = this.props.loading;
        return /*#__PURE__*/React.createElement(Message, {
          type: "loading"
        }, typeof loading === 'function' ? loading() : loading);
      }
      if (pdf === false) {
        var error = this.props.error;
        return /*#__PURE__*/React.createElement(Message, {
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
      return /*#__PURE__*/React.createElement("div", _extends({
        className: mergeClassNames('react-pdf__Document', className),
        ref: inputRef
      }, this.eventProps), this.renderContent());
    }
  }]);
  return Document;
}(PureComponent);
export { Document as default };
Document.defaultProps = {
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.',
  onPassword: function onPassword(callback, reason) {
    switch (reason) {
      case PasswordResponses.NEED_PASSWORD:
        {
          // eslint-disable-next-line no-alert
          var password = prompt('Enter the password to open this PDF file.');
          callback(password);
          break;
        }
      case PasswordResponses.INCORRECT_PASSWORD:
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
var isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);
Document.propTypes = _objectSpread(_objectSpread({}, eventProps), {}, {
  children: PropTypes.node,
  className: isClassName,
  error: isFunctionOrNode,
  externalLinkRel: PropTypes.string,
  externalLinkTarget: PropTypes.string,
  file: isFileProp,
  imageResourcesPath: PropTypes.string,
  inputRef: isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadProgress: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onPassword: PropTypes.func,
  onSourceError: PropTypes.func,
  onSourceSuccess: PropTypes.func,
  rotate: PropTypes.number
});