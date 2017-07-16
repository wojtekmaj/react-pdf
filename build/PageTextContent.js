'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var PageTextContent = function (_Component) {
  _inherits(PageTextContent, _Component);

  function PageTextContent() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PageTextContent);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PageTextContent.__proto__ || Object.getPrototypeOf(PageTextContent)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      textItems: null
    }, _this.onGetTextSuccess = function (textContent) {
      var textItems = null;
      if (textContent) {
        textItems = textContent.items;
      }

      (0, _util.callIfDefined)(_this.props.onGetTextSuccess, textItems);

      _this.setState({ textItems: textItems });
    }, _this.onGetTextError = function (error) {
      (0, _util.callIfDefined)(_this.props.onGetTextError, error);

      _this.setState({ textItems: false });
    }, _this.renderTextItem = function (textItem, itemIndex) {
      var _textItem$transform = _slicedToArray(textItem.transform, 6),
          left = _textItem$transform[4],
          bottom = _textItem$transform[5];

      var scale = _this.props.scale;
      var _this2 = _this,
          viewport = _this2.unrotatedViewport;

      var top = viewport.height / scale - bottom - textItem.height;

      return _react2.default.createElement(
        'div',
        {
          key: itemIndex,
          style: {
            position: 'absolute',
            fontSize: textItem.height + 'px',
            fontFamily: textItem.fontName + ', sans-serif',
            height: textItem.height + 'px',
            top: top * scale + 'px',
            left: left * scale + 'px',
            bottom: bottom * scale + 'px',
            transformOrigin: 'left bottom',
            whiteSpace: 'nowrap'
          },
          ref: function ref(_ref2) {
            if (!_ref2) {
              return;
            }

            _this.scaleTextItem(_ref2, textItem.width * scale);
          }
        },
        textItem.str
      );
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(PageTextContent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.getTextContent();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.page !== this.props.page) {
        this.getTextContent(nextProps);
      }
    }
  }, {
    key: 'getTextContent',
    value: function getTextContent() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var page = props.page;


      if (!page) {
        throw new Error('Attempted to load page text content, but no page was specified.');
      }

      if (this.state.textItems !== null) {
        this.setState({ textItems: null });
      }

      page.getTextContent().then(this.onGetTextSuccess).catch(this.onGetTextError);
    }
  }, {
    key: 'scaleTextItem',
    value: function scaleTextItem(item, targetWidth) {
      if (!item) {
        return;
      }

      var actualWidth = item.clientWidth;

      item.style.transform = 'scale(' + targetWidth / actualWidth + ')';
    }
  }, {
    key: 'renderTextItems',
    value: function renderTextItems() {
      var textItems = this.state.textItems;


      if (!textItems) {
        return null;
      }

      return textItems.map(this.renderTextItem);
    }
  }, {
    key: 'render',
    value: function render() {
      var rotate = this.props.rotate;
      var viewport = this.unrotatedViewport;


      return _react2.default.createElement(
        'div',
        {
          className: 'ReactPDF__Page__textContent',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: viewport.width + 'px',
            height: viewport.height + 'px',
            color: 'transparent',
            transform: 'translate(-50%, -50%) rotate(' + rotate + 'deg)'
          }
        },
        this.renderTextItems()
      );
    }
  }, {
    key: 'unrotatedViewport',
    get: function get() {
      var _props = this.props,
          page = _props.page,
          scale = _props.scale;


      return page.getViewport(scale);
    }
  }]);

  return PageTextContent;
}(_react.Component);

exports.default = PageTextContent;


PageTextContent.propTypes = {
  onGetTextError: _propTypes2.default.func,
  onGetTextSuccess: _propTypes2.default.func,
  page: _propTypes2.default.shape({
    getTextContent: _propTypes2.default.func.isRequired,
    getViewport: _propTypes2.default.func.isRequired
  }).isRequired,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number
};