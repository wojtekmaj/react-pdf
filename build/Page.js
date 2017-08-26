'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _PageCanvas = require('./PageCanvas');

var _PageCanvas2 = _interopRequireDefault(_PageCanvas);

var _PageTextContent = require('./PageTextContent');

var _PageTextContent2 = _interopRequireDefault(_PageTextContent);

var _util = require('./shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Page = function (_Component) {
  (0, _inherits3.default)(Page, _Component);

  function Page() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Page);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Page.__proto__ || (0, _getPrototypeOf2.default)(Page)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      page: null
    }, _this.onLoadSuccess = function (page) {
      _this.setState({ page: page });

      var _this2 = _this,
          scale = _this2.scale;


      (0, _util.callIfDefined)(_this.props.onLoadSuccess, (0, _extends3.default)({}, page, {
        // Legacy callback params
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
      }));
    }, _this.onLoadError = function (error) {
      (0, _util.callIfDefined)(_this.props.onLoadError, error);

      _this.setState({ page: false });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Page, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.loadPage();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.pdf !== this.props.pdf || this.getPageNumber(nextProps) !== this.getPageNumber()) {
        this.loadPage(nextProps);
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
     * Called when a page is loaded successfully
     */


    /**
     * Called when a page failed to load
     */

  }, {
    key: 'getPageIndex',
    value: function getPageIndex() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if ((0, _util.isProvided)(props.pageIndex)) {
        return props.pageIndex;
      }

      if ((0, _util.isProvided)(props.pageNumber)) {
        return props.pageNumber - 1;
      }

      return null;
    }
  }, {
    key: 'getPageNumber',
    value: function getPageNumber() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if ((0, _util.isProvided)(props.pageNumber)) {
        return props.pageNumber;
      }

      if ((0, _util.isProvided)(props.pageIndex)) {
        return props.pageIndex + 1;
      }

      return null;
    }
  }, {
    key: 'loadPage',
    value: function loadPage() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var pdf = props.pdf;

      var pageNumber = this.getPageNumber(props);

      if (!pdf) {
        throw new Error('Attempted to load a page, but no document was specified.');
      }

      if (this.state.page !== null) {
        this.setState({ page: null });
      }

      this.runningTask = (0, _util.makeCancellable)(pdf.getPage(pageNumber));

      return this.runningTask.promise.then(this.onLoadSuccess).catch(this.onLoadError);
    }
  }, {
    key: 'render',
    value: function render() {
      var pdf = this.props.pdf;
      var page = this.state.page;
      var pageIndex = this.pageIndex;


      if (!pdf || !page) {
        return null;
      }

      if (pageIndex < 0 || pageIndex > pdf.numPages) {
        return null;
      }

      var _props = this.props,
          onGetTextError = _props.onGetTextError,
          onGetTextSuccess = _props.onGetTextSuccess,
          onRenderError = _props.onRenderError,
          onRenderSuccess = _props.onRenderSuccess,
          renderTextLayer = _props.renderTextLayer;


      return _react2.default.createElement(
        'div',
        {
          className: 'ReactPDF__Page',
          style: { position: 'relative' }
        },
        _react2.default.createElement(_PageCanvas2.default, {
          onRenderError: onRenderError,
          onRenderSuccess: onRenderSuccess,
          page: page,
          rotate: this.rotate,
          scale: this.scale
        }),
        renderTextLayer && _react2.default.createElement(_PageTextContent2.default, {
          onGetTextError: onGetTextError,
          onGetTextSuccess: onGetTextSuccess,
          page: page,
          rotate: this.rotate,
          scale: this.scale
        })
      );
    }
  }, {
    key: 'pageIndex',
    get: function get() {
      return this.getPageIndex();
    }
  }, {
    key: 'pageNumber',
    get: function get() {
      return this.getPageNumber();
    }
  }, {
    key: 'rotate',
    get: function get() {
      var rotate = this.props.rotate;


      if ((0, _util.isProvided)(rotate)) {
        return rotate;
      }

      var page = this.state.page;


      return page.rotate;
    }
  }, {
    key: 'scale',
    get: function get() {
      var _props2 = this.props,
          scale = _props2.scale,
          width = _props2.width;
      var page = this.state.page;
      var rotate = this.rotate;

      // Be default, we'll render page at 100% * scale width.

      var pageScale = 1;

      // If width is defined, calculate the scale of the page so it could be of desired width.
      if (width) {
        var viewport = page.getViewport(scale, rotate);
        pageScale = width / viewport.width;
      }

      return scale * pageScale;
    }
  }]);
  return Page;
}(_react.Component);

exports.default = Page;


Page.defaultProps = {
  renderTextLayer: true,
  scale: 1.0
};

Page.propTypes = {
  onGetTextError: _propTypes2.default.func,
  onGetTextSuccess: _propTypes2.default.func,
  onLoadError: _propTypes2.default.func,
  onLoadSuccess: _propTypes2.default.func,
  onRenderError: _propTypes2.default.func,
  onRenderSuccess: _propTypes2.default.func,
  pageIndex: _propTypes2.default.number, // eslint-disable-line react/no-unused-prop-types
  pageNumber: _propTypes2.default.number, // eslint-disable-line react/no-unused-prop-types
  pdf: _propTypes2.default.shape({
    getPage: _propTypes2.default.func.isRequired,
    numPages: _propTypes2.default.number.isRequired
  }),
  renderTextLayer: _propTypes2.default.bool,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number,
  width: _propTypes2.default.number
};