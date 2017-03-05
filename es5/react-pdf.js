'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

PDFJS.disableWorker = true;

var ReactPDF = function (_Component) {
  _inherits(ReactPDF, _Component);

  function ReactPDF() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ReactPDF);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ReactPDF.__proto__ || Object.getPrototypeOf(ReactPDF)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ReactPDF, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.handleFileLoad();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.isParameterObject(nextProps.file)) {
        // File is a parameter object
        if (nextProps.file && !this.props.file || nextProps.file.data !== this.props.file.data || nextProps.file.range !== this.props.file.range || nextProps.file.url !== this.props.file.url) {
          this.handleFileLoad(nextProps);
          return;
        }
      } else if (nextProps.file && nextProps.file !== this.props.file) {
        // File is a normal object or not an object at all
        this.handleFileLoad(nextProps);
        return;
      }

      if (this.state.pdf && typeof nextProps.pageIndex !== 'undefined' && nextProps.pageIndex !== this.props.pageIndex) {
        this.loadPage(nextProps.pageIndex);
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextState.pdf !== this.state.pdf || nextState.page !== this.state.page || nextProps.width !== this.props.width || nextProps.scale !== this.props.scale;
    }

    /**
     * Called when a document is loaded successfully.
     */


    /**
     * Called when a document fails to load.
     */


    /**
     * Called when a page is loaded successfully.
     */


    /**
     * Called when a page is rendered successfully.
     */


    /**
     * Called when a page fails to load or render.
     */

  }, {
    key: 'getPageScale',
    value: function getPageScale() {
      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.page;
      var _props = this.props,
          scale = _props.scale,
          width = _props.width;

      // Be default, we'll render page at 100% * scale width.

      var pageScale = 1;

      // If width is defined, calculate the scale of the page so it could be of desired width.
      if (width) {
        pageScale = width / page.getViewport(scale).width;
      }

      return scale * pageScale;
    }
  }, {
    key: 'handleFileLoad',
    value: function handleFileLoad() {
      var _this2 = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var file = props.file;


      if (!file || this.isParameterObject(file) && !file.data && !file.range && !file.url) {
        return null;
      }

      this.setState({
        page: null,
        pdf: null
      });

      // File is a string
      if (typeof file === 'string') {
        // File is not data URI
        if (!this.isDataURI(file)) {
          if (window.location.protocol === 'file:') {
            this.displayCORSWarning();
          }

          return this.loadDocument(file);
        }

        // File is data URI
        file = this.dataURItoBlob(file);

        // Fall through to "File is a blob"
      }

      // File is a Blob
      if (file instanceof Blob) {
        file = URL.createObjectURL(file);

        return this.loadDocument(file);
      }

      // File is a File
      if (file instanceof File) {
        var _ret2 = function () {
          var reader = new FileReader();

          reader.onloadend = function () {
            _this2.loadDocument(new Uint8Array(reader.result));
          };

          return {
            v: reader.readAsArrayBuffer(file)
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }

      // File is an ArrayBuffer
      if (file instanceof ArrayBuffer) {
        return this.loadDocument(file);
      }

      // File is a parameter object
      if (this.isParameterObject(file)) {
        if (file.url && window.location.protocol === 'file:') {
          this.displayCORSWarning();
        }

        // Prevent from modifying props
        file = Object.assign({}, file);

        // File is data URI
        if (file.url && this.isDataURI(file.url)) {
          file = URL.createObjectURL(this.dataURItoBlob(file.url));
        }

        return this.loadDocument(file);
      }

      throw new Error('Unrecognized input type.');
    }
  }, {
    key: 'loadDocument',
    value: function loadDocument() {
      var _PDFJS;

      (_PDFJS = PDFJS).getDocument.apply(_PDFJS, arguments).then(this.onDocumentLoad).catch(this.onDocumentError);
    }
  }, {
    key: 'loadPage',
    value: function loadPage(pageIndex) {
      var pdf = this.state.pdf;


      if (!pdf) {
        throw new Error('Unexpected call to getPage() before the document has been loaded.');
      }

      var pageNumber = pageIndex + 1;

      if (!pageIndex || pageNumber < 1) {
        pageNumber = 1;
      } else if (pageNumber >= pdf.numPages) {
        pageNumber = pdf.numPages;
      }

      pdf.getPage(pageNumber).then(this.onPageLoad).catch(this.onPageError);
    }
  }, {
    key: 'renderNoData',
    value: function renderNoData() {
      return _react2.default.createElement(
        'div',
        null,
        this.props.noData
      );
    }
  }, {
    key: 'renderError',
    value: function renderError() {
      return _react2.default.createElement(
        'div',
        null,
        this.props.error
      );
    }
  }, {
    key: 'renderLoader',
    value: function renderLoader() {
      return _react2.default.createElement(
        'div',
        null,
        this.props.loading
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var file = this.props.file;
      var _state = this.state,
          pdf = _state.pdf,
          page = _state.page;


      if (!file) {
        return this.renderNoData();
      }

      if (pdf === false || page === false) {
        return this.renderError();
      }

      if (pdf === null || page === null) {
        return this.renderLoader();
      }

      return _react2.default.createElement('canvas', {
        ref: function ref(_ref2) {
          if (!_ref2) return;

          var canvas = _ref2;

          var pixelRatio = window.devicePixelRatio || 1;
          var viewport = page.getViewport(_this3.getPageScale() * pixelRatio);

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          canvas.style.height = viewport.height / pixelRatio + 'px';
          canvas.style.width = viewport.width / pixelRatio + 'px';

          var canvasContext = canvas.getContext('2d');

          var renderContext = {
            canvasContext: canvasContext,
            viewport: viewport
          };

          // If another render is in progress, let's cancel it
          /* eslint-disable no-underscore-dangle */
          if (_this3.renderer && _this3.renderer._internalRenderTask.running) {
            _this3.renderer._internalRenderTask.cancel();
          }
          /* eslint-enable no-underscore-dangle */

          _this3.renderer = page.render(renderContext);

          _this3.renderer.then(_this3.onPageRender).catch(function (dismiss) {
            if (dismiss === 'cancelled') {
              // Everything's alright
              return;
            }

            _this3.onPageError(dismiss);
          });
        }
      });
    }
  }]);

  return ReactPDF;
}(_react.Component);

var _initialiseProps = function _initialiseProps() {
  var _this4 = this;

  this.state = {
    pdf: null,
    page: null
  };

  this.onDocumentLoad = function (pdf) {
    _this4.callIfDefined(_this4.props.onDocumentLoad, {
      total: pdf.numPages
    });

    _this4.setState({ pdf: pdf });

    _this4.loadPage(_this4.props.pageIndex);
  };

  this.onDocumentError = function (error) {
    _this4.callIfDefined(_this4.props.onDocumentError, error);

    _this4.setState({ pdf: false });
  };

  this.onPageLoad = function (page) {
    var scale = _this4.getPageScale(page);

    _this4.callIfDefined(_this4.props.onPageLoad, {
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      get width() {
        return page.view[2] * scale;
      },
      get height() {
        return page.view[3] * scale;
      },
      scale: scale,
      get originalWidth() {
        return page.view[2];
      },
      get originalHeight() {
        return page.view[3];
      }
    });

    _this4.setState({ page: page });
  };

  this.onPageRender = function () {
    _this4.renderer = null;

    _this4.callIfDefined(_this4.props.onPageRender);
  };

  this.onPageError = function (error) {
    _this4.callIfDefined(_this4.props.onPageError, error);

    _this4.setState({ page: false });
  };

  this.callIfDefined = function (fn, args) {
    if (fn && typeof fn === 'function') {
      fn(args);
    }
  };

  this.displayCORSWarning = function () {
    // eslint-disable-next-line no-console
    console.warn('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
  };

  this.isParameterObject = function (object) {
    return object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && ['file', 'range', 'url'].some(function (key) {
      return Object.keys(object).includes(key);
    });
  };

  this.isDataURI = function (str) {
    return (/^data:/.test(str)
    );
  };

  this.dataURItoBlob = function (dataURI) {
    var byteString = void 0;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  };
};

exports.default = ReactPDF;


ReactPDF.defaultProps = {
  pageIndex: 0,
  scale: 1.0,
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.'
};

ReactPDF.propTypes = {
  error: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
  file: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.instanceOf(File), _react.PropTypes.instanceOf(Blob), _react.PropTypes.shape({
    data: _react.PropTypes.object,
    httpHeaders: _react.PropTypes.object,
    range: _react.PropTypes.object,
    url: _react.PropTypes.string
  })]),
  loading: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
  noData: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
  onDocumentError: _react.PropTypes.func,
  onDocumentLoad: _react.PropTypes.func,
  onPageError: _react.PropTypes.func,
  onPageLoad: _react.PropTypes.func,
  onPageRender: _react.PropTypes.func,
  pageIndex: _react.PropTypes.number,
  scale: _react.PropTypes.number,
  width: _react.PropTypes.number
};