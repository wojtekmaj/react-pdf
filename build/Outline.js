'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line no-underscore-dangle
if (!window._babelPolyfill) {
  // eslint-disable-next-line global-require
  require('babel-polyfill');
}

var Ref = function () {
  function Ref(_ref) {
    var num = _ref.num,
        gen = _ref.gen;
    (0, _classCallCheck3.default)(this, Ref);

    this.num = num;
    this.gen = gen;
  }

  (0, _createClass3.default)(Ref, [{
    key: 'toString',
    value: function toString() {
      var str = this.num + 'R';
      if (this.gen !== 0) {
        str += this.gen;
      }
      return str;
    }
  }]);
  return Ref;
}();

var Outline = function (_Component) {
  (0, _inherits3.default)(Outline, _Component);

  function Outline() {
    var _ref2;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Outline);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref2 = Outline.__proto__ || (0, _getPrototypeOf2.default)(Outline)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
      outline: null
    }, _this.onLoadSuccess = function (outline) {
      (0, _util.callIfDefined)(_this.props.onLoadSuccess);

      _this.runningTask = (0, _util.makeCancellable)(_this.parseOutline(outline));

      return _this.runningTask.promise.then(_this.onParseSuccess).catch(_this.onParseError);
    }, _this.onLoadError = function (error) {
      if (error === 'cancelled') {
        return;
      }

      (0, _util.callIfDefined)(_this.props.onLoadError, error);

      _this.setState({ outline: false });
    }, _this.onParseSuccess = function (outline) {
      (0, _util.callIfDefined)(_this.props.onParseSuccess, {
        outline: outline
      });

      _this.setState({ outline: outline });
    }, _this.onParseError = function (error) {
      if (error === 'cancelled') {
        return;
      }

      (0, _util.callIfDefined)(_this.props.onParseError, error);

      _this.setState({ outline: false });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Outline, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.loadOutline();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.pdf !== this.props.pdf) {
        this.loadOutline(nextProps);
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
     * Called when an outline is read successfully
     */


    /**
     * Called when an outline failed to read successfully
     */


    /**
     * Called when an outline failed to read successfully
     */

  }, {
    key: 'mapOutlineItem',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(item) {
        var _this5 = this;

        var pdf, mappedItem;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                pdf = this.props.pdf;
                mappedItem = {
                  title: item.title,
                  destination: item.dest,
                  getDestination: function getDestination() {
                    var _this2 = this;

                    return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                      return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              if (!(typeof _this2.destination === 'string')) {
                                _context.next = 2;
                                break;
                              }

                              return _context.abrupt('return', pdf.getDestination(_this2.destination));

                            case 2:
                              return _context.abrupt('return', _this2.destination);

                            case 3:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, _this2);
                    }))();
                  },
                  getPageIndex: function getPageIndex() {
                    var _this3 = this;

                    return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                      var destination, _destination, ref;

                      return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if ((0, _util.isDefined)(_this3.pageIndex)) {
                                _context2.next = 5;
                                break;
                              }

                              _context2.next = 3;
                              return _this3.getDestination();

                            case 3:
                              destination = _context2.sent;

                              if (destination) {
                                _destination = (0, _slicedToArray3.default)(destination, 1), ref = _destination[0];

                                _this3.pageIndex = pdf.getPageIndex(new Ref(ref));
                              }

                            case 5:
                              return _context2.abrupt('return', _this3.pageIndex);

                            case 6:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, _this3);
                    }))();
                  },
                  getPageNumber: function getPageNumber() {
                    var _this4 = this;

                    return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                      return _regenerator2.default.wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              if ((0, _util.isDefined)(_this4.pageNumber)) {
                                _context3.next = 5;
                                break;
                              }

                              _context3.next = 3;
                              return _this4.getPageIndex();

                            case 3:
                              _context3.t0 = _context3.sent;
                              _this4.pageNumber = _context3.t0 + 1;

                            case 5:
                              return _context3.abrupt('return', _this4.pageNumber);

                            case 6:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      }, _callee3, _this4);
                    }))();
                  }
                };

                if (!(item.items && item.items.length)) {
                  _context4.next = 6;
                  break;
                }

                _context4.next = 5;
                return _promise2.default.all(item.items.map(function (subitem) {
                  return _this5.mapOutlineItem(subitem);
                }));

              case 5:
                mappedItem.items = _context4.sent;

              case 6:
                return _context4.abrupt('return', mappedItem);

              case 7:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function mapOutlineItem(_x) {
        return _ref3.apply(this, arguments);
      }

      return mapOutlineItem;
    }()
  }, {
    key: 'parseOutline',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(outline) {
        var _this6 = this;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (outline) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return', null);

              case 2:
                return _context5.abrupt('return', _promise2.default.all(outline.map(function (item) {
                  return _this6.mapOutlineItem(item);
                })));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function parseOutline(_x2) {
        return _ref4.apply(this, arguments);
      }

      return parseOutline;
    }()
  }, {
    key: 'onItemClick',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(item) {
        var pageIndex, pageNumber;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return item.getPageIndex();

              case 2:
                pageIndex = _context6.sent;
                _context6.next = 5;
                return item.getPageNumber();

              case 5:
                pageNumber = _context6.sent;


                (0, _util.callIfDefined)(this.props.onItemClick, {
                  pageIndex: pageIndex,
                  pageNumber: pageNumber
                });

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function onItemClick(_x3) {
        return _ref5.apply(this, arguments);
      }

      return onItemClick;
    }()
  }, {
    key: 'loadOutline',
    value: function loadOutline() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var pdf = props.pdf;


      if (!pdf) {
        throw new Error('Attempted to load an outline, but no document was specified.');
      }

      if (this.state.outline !== null) {
        this.setState({ outline: null });
      }

      this.runningTask = (0, _util.makeCancellable)(pdf.getOutline());

      return this.runningTask.promise.then(this.onLoadSuccess).catch(this.onLoadError);
    }
  }, {
    key: 'renderOutline',
    value: function renderOutline() {
      var _this7 = this;

      var outline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.outline;

      return _react2.default.createElement(
        'ul',
        null,
        outline.map(function (item, itemIndex) {
          return _react2.default.createElement(
            'li',
            {
              key: typeof item.destination === 'string' ? item.destination : itemIndex
            },
            _react2.default.createElement(
              'a',
              {
                href: '#',
                onClick: function onClick(event) {
                  event.preventDefault();

                  _this7.onItemClick(item);
                }
              },
              item.title
            ),
            item.items && _this7.renderOutline(item.items)
          );
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var pdf = this.props.pdf;
      var outline = this.state.outline;


      if (!pdf || !outline) {
        return null;
      }

      return _react2.default.createElement(
        'div',
        { className: 'ReactPDF__Outline' },
        this.renderOutline()
      );
    }
  }]);
  return Outline;
}(_react.Component);

exports.default = Outline;


Outline.propTypes = {
  onItemClick: _propTypes2.default.func,
  onLoadError: _propTypes2.default.func,
  onLoadSuccess: _propTypes2.default.func,
  onParseError: _propTypes2.default.func,
  onParseSuccess: _propTypes2.default.func,
  pdf: _propTypes2.default.shape({
    getDestination: _propTypes2.default.func.isRequired,
    getOutline: _propTypes2.default.func.isRequired
  })
};