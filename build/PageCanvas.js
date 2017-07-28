'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var PageCanvas = function (_Component) {
  (0, _inherits3.default)(PageCanvas, _Component);

  function PageCanvas() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, PageCanvas);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = PageCanvas.__proto__ || (0, _getPrototypeOf2.default)(PageCanvas)).call.apply(_ref, [this].concat(args))), _this), _this.onRenderSuccess = function () {
      _this.renderer = null;

      (0, _util.callIfDefined)(_this.props.onRenderSuccess);
    }, _this.onRenderError = function (error) {
      (0, _util.callIfDefined)(_this.props.onRenderError, error);
    }, _this.drawPageOnCanvas = function (canvas) {
      if (!canvas) {
        return null;
      }

      var page = _this.props.page;
      var _this2 = _this,
          renderViewport = _this2.renderViewport,
          viewport = _this2.viewport;


      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;

      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      var canvasContext = canvas.getContext('2d');

      var renderContext = {
        canvasContext: canvasContext,
        viewport: renderViewport
      };

      // If another render is in progress, let's cancel it
      /* eslint-disable no-underscore-dangle */
      if (_this.renderer && _this.renderer._internalRenderTask.running) {
        _this.renderer._internalRenderTask.cancel();
      }
      /* eslint-enable no-underscore-dangle */

      _this.renderer = page.render(renderContext);

      return _this.renderer.then(_this.onRenderSuccess).catch(function (error) {
        if (error === 'cancelled') {
          // Everything's alright
          return;
        }

        _this.onRenderError(error);
      });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }
  /**
   * Called when a page is rendered successfully.
   */


  /**
   * Called when a page fails to render.
   */


  (0, _createClass3.default)(PageCanvas, [{
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement('canvas', {
        className: 'ReactPDF__Page__canvas',
        style: {
          display: 'block',
          userSelect: 'none'
        },
        ref: function ref(_ref2) {
          if (!_ref2) return;

          _this3.drawPageOnCanvas(_ref2);
        }
      });
    }
  }, {
    key: 'renderViewport',
    get: function get() {
      var _props = this.props,
          page = _props.page,
          rotate = _props.rotate,
          scale = _props.scale;


      var pixelRatio = (0, _util.getPixelRatio)();

      return page.getViewport(scale * pixelRatio, rotate);
    }
  }, {
    key: 'viewport',
    get: function get() {
      var _props2 = this.props,
          page = _props2.page,
          rotate = _props2.rotate,
          scale = _props2.scale;


      return page.getViewport(scale, rotate);
    }
  }]);
  return PageCanvas;
}(_react.Component);

exports.default = PageCanvas;


PageCanvas.propTypes = {
  onRenderError: _propTypes2.default.func,
  onRenderSuccess: _propTypes2.default.func,
  page: _propTypes2.default.shape({
    getViewport: _propTypes2.default.func.isRequired,
    render: _propTypes2.default.func.isRequired
  }).isRequired,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number
};