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

var ReactPDF = function (_Component) {
    _inherits(ReactPDF, _Component);

    function ReactPDF() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ReactPDF);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ReactPDF.__proto__ || Object.getPrototypeOf(ReactPDF)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            pdf: null,
            page: null
        }, _this.onDocumentLoad = function (pdf) {
            if (_this.props.onDocumentLoad && typeof _this.props.onDocumentLoad === 'function') {
                _this.props.onDocumentLoad({
                    total: pdf.numPages
                });
            }

            _this.setState({ pdf: pdf });

            _this.loadPage(_this.props.pageIndex);
        }, _this.onDocumentError = function () {
            if (_this.props.onDocumentError && typeof _this.props.onDocumentError === 'function') {
                _this.props.onDocumentError();
            }

            _this.setState({ pdf: false });
        }, _this.onPageLoad = function (page) {
            if (_this.props.onPageLoad && typeof _this.props.onPageLoad === 'function') {
                _this.props.onPageLoad({
                    pageIndex: page.pageIndex,
                    pageNumber: page.pageNumber
                });
            }

            _this.setState({ page: page });
        }, _this.onPageError = function () {
            if (_this.props.onPageError && typeof _this.props.onPageError === 'function') {
                _this.props.onPageError();
            }

            _this.setState({ page: false });
        }, _this.onPageRender = function () {
            if (_this.props.onPageRender && typeof _this.props.onPageLoad === 'function') {
                _this.props.onPageRender();
            }
        }, _this.isParameterObject = function (object) {
            return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && (object.url || object.data || object.range);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ReactPDF, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handleFileLoad();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (this.isParameterObject(newProps.file)) {
                // File is a parameter object
                if (newProps.file.url !== this.props.file.url || newProps.file.data !== this.props.file.data || newProps.file.range !== this.props.file.range) {
                    this.handleFileLoad(newProps);
                    return;
                }
            } else if (newProps.file && newProps.file !== this.props.file) {
                // File is a normal object or not an object at all
                this.handleFileLoad(newProps);
                return;
            }

            if (this.state.pdf && typeof newProps.pageIndex !== 'undefined' && newProps.pageIndex !== this.props.pageIndex) {
                this.loadPage(newProps.pageIndex);
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return nextState.pdf !== this.state.pdf || nextState.page !== this.state.page;
        }
    }, {
        key: 'handleFileLoad',
        value: function handleFileLoad() {
            var _this2 = this;

            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
            var file = props.file;


            if (!file) return;

            this.setState({
                pdf: null,
                page: null
            });

            // File is a string
            if (typeof file === 'string') {
                if (window.location.protocol === 'file:') {
                    console.warn('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
                }
                this.loadDocument(file);
                return;
            }

            // File is a file
            if (file instanceof File) {
                var _ret2 = function () {
                    var reader = new FileReader();

                    reader.onloadend = function () {
                        _this2.loadDocument(new Uint8Array(reader.result));
                    };

                    reader.readAsArrayBuffer(file);
                    return {
                        v: void 0
                    };
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }

            // File is a Uint8Array object or parameter object
            if ((typeof file === 'undefined' ? 'undefined' : _typeof(file)) === 'object') {
                if (this.isParameterObject(file)) {
                    // File is a parameter object
                    // Prevent from modifying props
                    file = Object.assign({}, file);
                }

                this.loadDocument(file);
                return;
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
            if (!this.state.pdf) {
                throw new Error('Unexpected call to getPage() before the document has been loaded.');
            }

            var pageNumber = pageIndex + 1;

            if (!pageIndex || pageNumber < 1) {
                pageNumber = 1;
            } else if (pageNumber >= this.state.pdf.numPages) {
                pageNumber = this.state.pdf.numPages;
            }

            this.state.pdf.getPage(pageNumber).then(this.onPageLoad).catch(this.onPageError);
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

            var scale = this.props.scale;
            var _state = this.state,
                pdf = _state.pdf,
                page = _state.page;


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

                    var context = canvas.getContext('2d');
                    var viewport = page.getViewport(scale);

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext).then(_this3.onPageRender);
                }
            });
        }
    }]);

    return ReactPDF;
}(_react.Component);

exports.default = ReactPDF;


ReactPDF.defaultProps = {
    pageIndex: 0,
    scale: 1.0,
    error: 'Failed to load PDF file.',
    loading: 'Loading PDF…'
};

ReactPDF.propTypes = {
    error: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
    file: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.instanceOf(File), _react.PropTypes.shape({
        url: _react.PropTypes.string,
        data: _react.PropTypes.object,
        range: _react.PropTypes.object,
        httpHeaders: _react.PropTypes.object
    })]),
    loading: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
    onDocumentError: _react.PropTypes.func,
    onDocumentLoad: _react.PropTypes.func,
    onPageError: _react.PropTypes.func,
    onPageLoad: _react.PropTypes.func,
    onPageRender: _react.PropTypes.func,
    pageIndex: _react.PropTypes.number,
    scale: _react.PropTypes.number
};