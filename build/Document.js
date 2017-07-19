'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Loads a PDF document. Passes it to all children.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Document = function (_Component) {
  _inherits(Document, _Component);

  function Document() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Document);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Document.__proto__ || Object.getPrototypeOf(Document)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      pdf: null
    }, _this.onSourceSuccess = function (source) {
      (0, _util.callIfDefined)(_this.props.onSourceSuccess);

      if (!PDFJS) {
        throw new Error('Could not load the document. PDF.js is not loaded.');
      }

      _this.setState({ pdf: null });

      if (!source) {
        return;
      }

      PDFJS.getDocument(source).then(_this.onLoadSuccess).catch(_this.onLoadError);
    }, _this.onSourceError = function (error) {
      (0, _util.callIfDefined)(_this.props.onSourceError, error);

      _this.setState({ pdf: false });
    }, _this.onLoadSuccess = function (pdf) {
      (0, _util.callIfDefined)(_this.props.onLoadSuccess, pdf);

      _this.setState({ pdf: pdf });
    }, _this.onLoadError = function (error) {
      (0, _util.callIfDefined)(_this.props.onLoadError, error);

      _this.setState({ pdf: false });
    }, _this.findDocumentSource = function () {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.props;
      return new Promise(function (resolve, reject) {
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
          if (_util.isLocalFileSystem) {
            // @TODO: Display CORS warning
          }

          return resolve(file);
        }

        if ((0, _util.isArrayBuffer)(file)) {
          return resolve(file);
        }

        if ((0, _util.isParamObject)(file)) {
          // Prevent from modifying props
          var modifiedFile = Object.assign({}, file);

          if ('url' in modifiedFile) {
            // File is data URI
            if ((0, _util.isDataURI)(modifiedFile.url)) {
              var _fileBlobURL = (0, _util.dataURItoURL)(modifiedFile.url);

              modifiedFile.url = _fileBlobURL;
            } else if (_util.isLocalFileSystem) {
              // @TODO: Display CORS warning
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
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Document, [{
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
      if ((typeof nextFile === 'undefined' ? 'undefined' : _typeof(nextFile)) !== (typeof file === 'undefined' ? 'undefined' : _typeof(file))) {
        return true;
      }

      return nextFile !== file;
    }
  }, {
    key: 'loadDocument',
    value: function loadDocument() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      this.findDocumentSource(props).then(this.onSourceSuccess).catch(this.onSourceError);
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
}(_react.Component);

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
  onLoadSuccess: _propTypes2.default.func,
  onLoadError: _propTypes2.default.func,
  onSourceError: _propTypes2.default.func,
  onSourceSuccess: _propTypes2.default.func,
  rotate: _propTypes2.default.number
};