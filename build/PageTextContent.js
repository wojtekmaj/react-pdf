'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

// Render disproportion above which font will be considered broken and fallback will be used
var BROKEN_FONT_ALARM_THRESHOLD = 0.1;

var PageTextContent = function (_Component) {
  (0, _inherits3.default)(PageTextContent, _Component);

  function PageTextContent() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, PageTextContent);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = PageTextContent.__proto__ || (0, _getPrototypeOf2.default)(PageTextContent)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
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
      var _textItem$transform = (0, _slicedToArray3.default)(textItem.transform, 6),
          fontSizePx = _textItem$transform[0],
          left = _textItem$transform[4],
          baselineBottom = _textItem$transform[5];

      var scale = _this.props.scale;
      // Distance from top of the page to the baseline

      var fontName = textItem.fontName;

      var fontSize = fontSizePx * scale + 'px';

      return _react2.default.createElement(
        'div',
        {
          key: itemIndex,
          style: {
            height: '1em',
            fontFamily: fontName,
            fontSize: fontSize,
            position: 'absolute',
            left: left * scale + 'px',
            bottom: baselineBottom * scale + 'px',
            transformOrigin: 'left bottom',
            whiteSpace: 'pre'
          },
          ref: function ref(_ref2) {
            if (!_ref2) {
              return;
            }

            _this.alignTextItem(_ref2, textItem);
          }
        },
        textItem.str
      );
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(PageTextContent, [{
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

      return page.getTextContent().then(this.onGetTextSuccess).catch(this.onGetTextError);
    }
  }, {
    key: 'getFontData',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(fontFamily) {
        var page, font;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                page = this.props.page;
                _context.next = 3;
                return page.commonObjs.ensureObj(fontFamily);

              case 3:
                font = _context.sent;
                return _context.abrupt('return', font.data);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getFontData(_x2) {
        return _ref3.apply(this, arguments);
      }

      return getFontData;
    }()
  }, {
    key: 'alignTextItem',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(element, textItem) {
        var scale, targetWidth, fontData, actualWidth, widthDisproportion, repairsNeeded, fallbackFontName, ascent;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (element) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return');

              case 2:
                scale = this.props.scale;
                targetWidth = textItem.width * scale;
                _context2.next = 6;
                return this.getFontData(textItem.fontName);

              case 6:
                fontData = _context2.sent;
                actualWidth = element.getBoundingClientRect().width;
                widthDisproportion = Math.abs(targetWidth / actualWidth - 1);
                repairsNeeded = widthDisproportion > BROKEN_FONT_ALARM_THRESHOLD;


                if (repairsNeeded) {
                  fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';

                  element.style.fontFamily = fallbackFontName;

                  actualWidth = element.getBoundingClientRect().width;
                }

                ascent = fontData ? fontData.ascent : 1;

                element.style.transform = 'scaleX(' + targetWidth / actualWidth + ') translateY(' + (1 - ascent) * 100 + '%)';

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function alignTextItem(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return alignTextItem;
    }()
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
    commonObjs: _propTypes2.default.shape({
      objs: _propTypes2.default.object.isRequired
    }).isRequired,
    getTextContent: _propTypes2.default.func.isRequired,
    getViewport: _propTypes2.default.func.isRequired,
    transport: _propTypes2.default.shape({
      fontLoader: _propTypes2.default.object.isRequired
    }).isRequired
  }).isRequired,
  rotate: _propTypes2.default.number,
  scale: _propTypes2.default.number
};