'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Page = function (_Component) {
  _inherits(Page, _Component);

  function Page() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Page);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Page.__proto__ || Object.getPrototypeOf(Page)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      page: null
    }, _this.onLoadSuccess = function (page) {
      _this.setState({ page: page });

      var _this2 = _this,
          scale = _this2.scale;


      (0, _util.callIfDefined)(_this.props.onLoadSuccess, _extends({}, page, {
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
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Page, [{
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
        // @TODO: Page number isn't always the same
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
        // @TODO: Page index isn't always the same
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

      pdf.getPage(pageNumber).then(this.onLoadSuccess).catch(this.onLoadError);
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
          onRenderSuccess = _props.onRenderSuccess;


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
        _react2.default.createElement(_PageTextContent2.default, {
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
      // @TODO: Page numer isn't always the same
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
  scale: 1.0
};

Page.propTypes = {
  onGetTextError: _propTypes2.default.func,
  onGetTextSuccess: _propTypes2.default.func,
  onLoadError: _propTypes2.default.func,
  onLoadSuccess: _propTypes2.default.func,
  onRenderError: _propTypes2.default.func,
  onRenderSuccess: _propTypes2.default.func,
  // @TODO: Check if > 0, < pdf.numPages
  pageIndex: _propTypes2.default.number,
  pageNumber: _propTypes2.default.number,
  pdf: _propTypes2.default.object,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number,
  width: _propTypes2.default.number
};