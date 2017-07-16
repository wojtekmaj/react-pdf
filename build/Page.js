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
    }, _this.onRenderSuccess = function () {
      _this.renderer = null;

      (0, _util.callIfDefined)(_this.props.onRenderSuccess);
    }, _this.onRenderError = function (error) {
      (0, _util.callIfDefined)(_this.props.onRenderError, error);

      _this.setState({ page: false });
    }, _this.drawPageOnCanvas = function (canvas) {
      if (!canvas) {
        return;
      }

      var page = _this.state.page;
      var _this3 = _this,
          rotate = _this3.rotate,
          scale = _this3.scale;


      var pixelRatio = (0, _util.getPixelRatio)();
      var viewport = page.getViewport(scale * pixelRatio, rotate);

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      canvas.style.height = Math.floor(viewport.height / pixelRatio) + 'px';
      canvas.style.width = Math.floor(viewport.width / pixelRatio) + 'px';

      var canvasContext = canvas.getContext('2d');

      var renderContext = {
        canvasContext: canvasContext,
        viewport: viewport
      };

      // If another render is in progress, let's cancel it
      /* eslint-disable no-underscore-dangle */
      if (_this.renderer && _this.renderer._internalRenderTask.running) {
        _this.renderer._internalRenderTask.cancel();
      }
      /* eslint-enable no-underscore-dangle */

      _this.renderer = page.render(renderContext);

      _this.renderer.then(_this.onRenderSuccess).catch(function (dismiss) {
        if (dismiss === 'cancelled') {
          // Everything's alright
          return;
        }

        _this.onRenderError(dismiss);
      });
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
      if (nextProps.pdf !== this.props.pdf) {
        this.setState({ page: null });
      }

      if (this.getPageIndex(nextProps) !== this.getPageIndex()) {
        this.loadPage(nextProps);
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextState.pdf !== this.state.pdf || nextState.page !== this.state.page || !Object.is(nextProps.rotate % 360, this.props.rotate % 360) || // Supports comparing NaN
      nextProps.width !== this.props.width || nextProps.scale !== this.props.scale;
    }

    /**
     * Called when a document is read successfully
     */


    /**
     * Called when a document failed to read successfully
     */


    /**
     * Called when a page is rendered successfully.
     */


    /**
     * Called when a page fails to load or render.
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

      pdf.getPage(pageNumber).then(this.onLoadSuccess).catch(this.onLoadError);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var pdf = this.props.pdf;
      var page = this.state.page;
      var pageIndex = this.pageIndex;


      if (!pdf || !page) {
        return null;
      }

      if (pageIndex < 0 || pageIndex > pdf.numPages) {
        return null;
      }

      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__Page' },
        _react2.default.createElement('canvas', {
          ref: function ref(_ref2) {
            if (!_ref2) return;

            _this4.drawPageOnCanvas(_ref2);
          }
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
      var _props = this.props,
          scale = _props.scale,
          width = _props.width;
      var page = this.state.page;
      var rotate = this.rotate;

      // Be default, we'll render page at 100% * scale width.

      var pageScale = 1;

      // If width is defined, calculate the scale of the page so it could be of desired width.
      if (width) {
        pageScale = width / page.getViewport(scale, rotate).width;
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
  // @TODO: Check if > 0, < pdf.numPages
  onLoadError: _propTypes2.default.func,
  onLoadSuccess: _propTypes2.default.func,
  onRenderError: _propTypes2.default.func,
  onRenderSuccess: _propTypes2.default.func,
  pageIndex: _propTypes2.default.number,
  pageNumber: _propTypes2.default.number,
  pdf: _propTypes2.default.object,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number,
  width: _propTypes2.default.number
};