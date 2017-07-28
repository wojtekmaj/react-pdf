'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Document = function (_Component) {
  (0, _inherits3.default)(Document, _Component);

  function Document() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Document);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Document.__proto__ || (0, _getPrototypeOf2.default)(Document)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      pdf: null
    }, _this.onSourceSuccess = function (source) {
      (0, _util.callIfDefined)(_this.props.onSourceSuccess);

      if (!PDFJS) {
        throw new Error('Could not load the document. PDF.js is not loaded.');
      }

      _this.setState({ pdf: null });

      if (!source) {
        return null;
      }

      _this.runningTask = (0, _util.makeCancellable)(PDFJS.getDocument(source));

      return _this.runningTask.promise.then(_this.onLoadSuccess).catch(_this.onLoadError);
    }, _this.onSourceError = function (error) {
      if (error === 'cancelled') {
        return;
      }

      (0, _util.callIfDefined)(_this.props.onSourceError, error);

      _this.setState({ pdf: false });
    }, _this.onLoadSuccess = function (pdf) {
      (0, _util.callIfDefined)(_this.props.onLoadSuccess, pdf);

      _this.setState({ pdf: pdf });
    }, _this.onLoadError = function (error) {
      if (error === 'cancelled') {
        return;
      }

      (0, _util.callIfDefined)(_this.props.onLoadError, error);

      _this.setState({ pdf: false });
    }, _this.findDocumentSource = function () {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.props;
      return new _promise2.default(function (resolve, reject) {
        var file = props.file;


        if (!file) {
          resolve(null);
        }

        // File is data URI
        if ((0, _util.isDataURI)(file)) {
          var fileBlobURL = (0, _util.dataURItoURL)(file);
          return resolve(fileBlobURL);
        }

        // File is a string
        if ((0, _util.isString)(file)) {
          (0, _util.displayCORSWarning)();

          return resolve(file);
        }

        if ((0, _util.isArrayBuffer)(file)) {
          return resolve(file);
        }

        if ((0, _util.isParamObject)(file)) {
          // Prevent from modifying props
          var modifiedFile = (0, _assign2.default)({}, file);

          if ('url' in modifiedFile) {
            // File is data URI
            if ((0, _util.isDataURI)(modifiedFile.url)) {
              var _fileBlobURL = (0, _util.dataURItoURL)(modifiedFile.url);

              modifiedFile.url = _fileBlobURL;
            } else {
              (0, _util.displayCORSWarning)();
            }
          }

          return resolve(modifiedFile);
        }

        /**
         * The cases below are browser-only.
         * If you're running on a non-browser environment, these cases will be of no use.
         */
        if (_util.isBrowser) {
          // File is a Blob
          if ((0, _util.isBlob)(file)) {
            var fileURL = (0, _util.getBlobURL)(file);
            return resolve(fileURL);
          }

          // File is a File
          if ((0, _util.isFile)(file)) {
            var reader = new FileReader();
            reader.onloadend = function () {
              return resolve(new Uint8Array(reader.result));
            };
            reader.readAsArrayBuffer(file);
          }
        }

        // No supported loading method worked
        return reject();
      });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Document, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.loadDocument();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.shouldLoadDocument(nextProps)) {
        this.loadDocument(nextProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.runningTask && this.runningTask.cancel) {
        this.runningTask.cancel();
      }
    }

    /**
     * Called when a document source is resolved correctly
     */


    /**
     * Called when a document source failed to be resolved correctly
     */


    /**
     * Called when a document is read successfully
     */


    /**
     * Called when a document failed to read successfully
     */

  }, {
    key: 'shouldLoadDocument',
    value: function shouldLoadDocument(nextProps) {
      var nextFile = nextProps.file;
      var file = this.props.file;

      // We got an object and previously it was an object too - we need to compare deeply

      if ((0, _util.isParamObject)(nextFile) && (0, _util.isParamObject)(file)) {
        return nextFile.data !== file.data || nextFile.range !== file.range || nextFile.url !== file.url;
      }

      // We either have or had an object - most likely there was a change
      if ((0, _util.isParamObject)(nextFile) !== (0, _util.isParamObject)(file)) {
        return true;
      }

      // We got file of different type - clearly there's been a change
      if ((typeof nextFile === 'undefined' ? 'undefined' : (0, _typeof3.default)(nextFile)) !== (typeof file === 'undefined' ? 'undefined' : (0, _typeof3.default)(file))) {
        return true;
      }

      return nextFile !== file;
    }
  }, {
    key: 'loadDocument',
    value: function loadDocument() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      this.runningTask = (0, _util.makeCancellable)(this.findDocumentSource(props));

      return this.runningTask.promise.then(this.onSourceSuccess).catch(this.onSourceError);
    }

    /**
     * Attempts to find a document source based on props.
     */

  }, {
    key: 'renderNoData',
    value: function renderNoData() {
      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__NoData' },
        this.props.noData
      );
    }
  }, {
    key: 'renderError',
    value: function renderError() {
      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__Error' },
        this.props.error
      );
    }
  }, {
    key: 'renderLoader',
    value: function renderLoader() {
      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__Loader' },
        this.props.loading
      );
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _props = this.props,
          children = _props.children,
          rotate = _props.rotate;
      var pdf = this.state.pdf;


      var childProps = {
        pdf: pdf,
        rotate: rotate
      };

      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__Document' },
        _react.Children.map(children, function (child) {
          return _react2.default.cloneElement(child, childProps);
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var file = this.props.file;


      if (!file) {
        return this.renderNoData();
      }

      var pdf = this.state.pdf;


      if (pdf === null) {
        return this.renderLoader();
      }

      if (pdf === false) {
        return this.renderError();
      }

      return this.renderChildren();
    }
  }]);
  return Document;
}(_react.Component); /**
                      * Loads a PDF document. Passes it to all children.
                      */


exports.default = Document;


Document.defaultProps = {
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.'
};

Document.propTypes = {
  children: _propTypes2.default.node,
  error: _propTypes2.default.node,
  file: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.instanceOf(File), _propTypes2.default.instanceOf(Blob), _propTypes2.default.instanceOf(ArrayBuffer), _propTypes2.default.shape({
    data: _propTypes2.default.object,
    httpHeaders: _propTypes2.default.object,
    range: _propTypes2.default.object,
    url: _propTypes2.default.string,
    withCredentials: _propTypes2.default.bool
  })]),
  loading: _propTypes2.default.node,
  noData: _propTypes2.default.node,
  onLoadError: _propTypes2.default.func,
  onLoadSuccess: _propTypes2.default.func,
  onSourceError: _propTypes2.default.func,
  onSourceSuccess: _propTypes2.default.func,
  rotate: _propTypes2.default.number
};