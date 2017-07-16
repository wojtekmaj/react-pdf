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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ref = function () {
  function Ref(_ref) {
    var num = _ref.num,
        gen = _ref.gen;

    _classCallCheck(this, Ref);

    this.num = num;
    this.gen = gen;
  }

  _createClass(Ref, [{
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
  _inherits(Outline, _Component);

  function Outline() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, Outline);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Outline.__proto__ || Object.getPrototypeOf(Outline)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
      outline: null
    }, _this.onLoadSuccess = function (outline) {
      (0, _util.callIfDefined)(_this.props.onLoadSuccess);

      _this.parseOutline(outline).then(_this.onParseSuccess).catch(_this.onParseError);
    }, _this.onLoadError = function (error) {
      (0, _util.callIfDefined)(_this.props.onLoadError, error);

      _this.setState({ outline: false });
    }, _this.onParseSuccess = function (outline) {
      (0, _util.callIfDefined)(_this.props.onParseSuccess, {
        outline: outline
      });

      _this.setState({ outline: outline });
    }, _this.onLoadError = function (error) {
      (0, _util.callIfDefined)(_this.props.onParseError, error);

      _this.setState({ outline: false });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Outline, [{
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
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(item) {
        var _this5 = this;

        var pdf, mappedItem;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                pdf = this.props.pdf;
                mappedItem = {
                  title: item.title,
                  destinationId: item.dest,
                  getDestination: function getDestination() {
                    var _this2 = this;

                    return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                      var destinationId;
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              destinationId = _this2.destinationId;
                              return _context.abrupt('return', pdf.getDestination(destinationId));

                            case 2:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, _this2);
                    }))();
                  },
                  getPageIndex: function getPageIndex() {
                    var _this3 = this;

                    return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                      var _ref4, _ref5, ref;

                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if ((0, _util.isDefined)(_this3.pageIndex)) {
                                _context2.next = 7;
                                break;
                              }

                              _context2.next = 3;
                              return _this3.getDestination();

                            case 3:
                              _ref4 = _context2.sent;
                              _ref5 = _slicedToArray(_ref4, 1);
                              ref = _ref5[0];

                              _this3.pageIndex = pdf.getPageIndex(new Ref(ref));

                            case 7:
                              return _context2.abrupt('return', _this3.pageIndex);

                            case 8:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, _this3);
                    }))();
                  },
                  getPageNumber: function getPageNumber() {
                    var _this4 = this;

                    return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                      return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
                return Promise.all(item.items.map(function (subitem) {
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
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(outline) {
        var _this6 = this;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (outline) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return', null);

              case 2:
                return _context5.abrupt('return', Promise.all(outline.map(function (item) {
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
        return _ref6.apply(this, arguments);
      }

      return parseOutline;
    }()
  }, {
    key: 'onItemClick',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(item) {
        var pageIndex, pageNumber;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
        return _ref7.apply(this, arguments);
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

      pdf.getOutline().then(this.onLoadSuccess).catch(this.onLoadError);
    }
  }, {
    key: 'renderOutline',
    value: function renderOutline() {
      var _this7 = this;

      var outline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.outline;

      return _react2.default.createElement(
        'ul',
        null,
        outline.map(function (item) {
          return _react2.default.createElement(
            'li',
            { key: item.destinationId },
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
  pdf: _propTypes2.default.object
};