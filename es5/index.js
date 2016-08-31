'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

var ReactPDF = function (_React$Component) {
    _inherits(ReactPDF, _React$Component);

    function ReactPDF(props) {
        _classCallCheck(this, ReactPDF);

        var _this = _possibleConstructorReturn(this, (ReactPDF.__proto__ || Object.getPrototypeOf(ReactPDF)).call(this, props));

        _this.state = {};

        _this.onDocumentComplete = _this.onDocumentComplete.bind(_this);
        _this.onPageComplete = _this.onPageComplete.bind(_this);
        return _this;
    }

    _createClass(ReactPDF, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._isMounted = true;

            this.handleProps();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.file && newProps.file !== this.props.file || newProps.content && newProps.content !== this.props.content) {
                this.handleProps(newProps);
            }

            if (this.state.pdf && newProps.page && newProps.page !== this.props.page) {
                this.setState({ page: null });
                this.state.pdf.getPage(newProps.page).then(this.onPageComplete);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._isMounted = false;
        }
    }, {
        key: 'onDocumentComplete',
        value: function onDocumentComplete(pdf) {
            if (!this._isMounted) return;

            this.setState({
                pdf: pdf
            });

            if (this.props.onDocumentComplete && typeof this.props.onDocumentComplete === 'function') {
                this.props.onDocumentComplete(pdf.numPages);
            }

            pdf.getPage(this.props.page).then(this.onPageComplete);
        }
    }, {
        key: 'onPageComplete',
        value: function onPageComplete(page) {
            if (!this._isMounted) return;

            this.setState({
                page: page
            });

            if (this.props.onPageComplete && typeof this.props.onPageComplete === 'function') {
                this.props.onPageComplete(page.pageIndex + 1);
            }
        }
    }, {
        key: 'handleProps',
        value: function handleProps() {
            var _this2 = this;

            var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

            var self = this;
            if (props.file) {
                var _ret = function () {
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

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            } else if (props.content) {
                var bytes = window.atob(props.content);
                var byteLength = bytes.length;
                var byteArray = new Uint8Array(new ArrayBuffer(byteLength));

                for (var index = 0; index < byteLength; index++) {
                    byteArray[index] = bytes.charCodeAt(index);
                }

                this.loadPDFDocument(byteArray);
            } else {
                console.error('React-PDF works with a file(URL) or (base64)content. At least one needs to be provided!'); // eslint-disable-line max-len, no-console
            }
        }
    }, {
        key: 'loadPDFDocument',
        value: function loadPDFDocument(byteArray) {
            PDFJS.getDocument(byteArray).then(this.onDocumentComplete);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var self = this;

            if (this.state.page) {
                setTimeout(function () {
                    if (self._isMounted) {
                        var canvas = self.pdfCanvas;
                        var context = canvas.getContext('2d');
                        var scale = self.props.scale;
                        var viewport = self.state.page.getViewport(scale);

                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };

                        self.state.page.render(renderContext);
                    }
                });

                return _react2.default.createElement('canvas', { ref: function ref(_ref) {
                        return _this3.pdfCanvas = _ref;
                    } });
            }

            return _react2.default.createElement(
                'div',
                null,
                this.props.loading
            );
        }
    }]);

    return ReactPDF;
}(_react2.default.Component);

exports.default = ReactPDF;


ReactPDF.defaultProps = {
    page: 1,
    scale: 1.0,
    loading: 'Loading PDF…'
};

ReactPDF.propTypes = {
    file: _react2.default.PropTypes.string,
    content: _react2.default.PropTypes.string,
    page: _react2.default.PropTypes.number,
    scale: _react2.default.PropTypes.number,
    loading: _react2.default.PropTypes.string,
    onDocumentComplete: _react2.default.PropTypes.func,
    onPageComplete: _react2.default.PropTypes.func
};