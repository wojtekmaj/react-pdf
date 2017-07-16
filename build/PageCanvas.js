'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var PageCanvas = function (_Component) {
  _inherits(PageCanvas, _Component);

  function PageCanvas() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PageCanvas);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PageCanvas.__proto__ || Object.getPrototypeOf(PageCanvas)).call.apply(_ref, [this].concat(args))), _this), _this.onRenderSuccess = function () {
      _this.renderer = null;

      (0, _util.callIfDefined)(_this.props.onRenderSuccess);
    }, _this.onRenderError = function (error) {
      (0, _util.callIfDefined)(_this.props.onRenderError, error);
    }, _this.drawPageOnCanvas = function (canvas) {
      if (!canvas) {
        return;
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
  /**
   * Called when a page is rendered successfully.
   */


  /**
   * Called when a page fails to render.
   */


  _createClass(PageCanvas, [{
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