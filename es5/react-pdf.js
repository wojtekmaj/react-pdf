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
            _this.setState({ page: false });
        }, _this.onPageRender = function () {
            if (_this.props.onPageRender && typeof _this.props.onPageLoad === 'function') {
                _this.props.onPageRender();
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ReactPDF, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handleProps();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.file && newProps.file !== this.props.file || newProps.content && newProps.content !== this.props.content) {
                this.handleProps(newProps);
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
        key: 'handleProps',
        value: function handleProps() {
            var _this2 = this;

            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

            var self = this;

            if (props.file) {
                var _ret2 = function () {
                    if (typeof props.file === 'string') {
                        _this2.loadPDFDocument(props.file);
                        return {
                            v: void 0
                        };
                    }

                    var reader = new FileReader();

                    reader.onloadend = function () {
                        self.loadPDFDocument(new Uint8Array(reader.result));
                    };

                    reader.readAsArrayBuffer(props.file);
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            } else if (props.content) {
                var bytes = window.atob(props.content);
                var byteLength = bytes.length;
                var byteArray = new Uint8Array(new ArrayBuffer(byteLength));

                for (var index = 0; index < byteLength; index += 1) {
                    byteArray[index] = bytes.charCodeAt(index);
                }

                this.loadPDFDocument(byteArray);
            } else {
                console.error('React-PDF works with a file(URL) or (base64)content. At least one needs to be provided!'); // eslint-disable-line max-len, no-console
            }
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
        key: 'loadPDFDocument',
        value: function loadPDFDocument(byteArray) {
            PDFJS.getDocument(byteArray).then(this.onDocumentLoad).catch(this.onDocumentError);
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
    content: _react.PropTypes.string,
    error: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
    file: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]),
    loading: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.node]),
    onDocumentLoad: _react.PropTypes.func,
    onPageLoad: _react.PropTypes.func,
    onPageRender: _react.PropTypes.func,
    pageIndex: _react.PropTypes.number,
    scale: _react.PropTypes.number
};