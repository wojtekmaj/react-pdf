"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _enzyme = require("enzyme");

var _PageSVG = require("../PageSVG");

var _failing_page = _interopRequireDefault(require("../../../__mocks__/_failing_page"));

var _utils = require("../../__tests__/utils");

/* eslint-disable comma-dangle */
describe('PageSVG', function () {
  describe('loading', function () {
    it('calls onRenderError when failed to render canvas',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      var _makeAsyncCallback, onRenderError, onRenderErrorPromise;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _makeAsyncCallback = (0, _utils.makeAsyncCallback)(), onRenderError = _makeAsyncCallback.func, onRenderErrorPromise = _makeAsyncCallback.promise;
              (0, _utils.muteConsole)();
              (0, _enzyme.mount)(_react["default"].createElement(_PageSVG.PageSVGInternal, {
                onRenderError: onRenderError,
                page: _failing_page["default"]
              }));
              expect.assertions(1);
              _context.next = 6;
              return expect(onRenderErrorPromise).resolves.toBeInstanceOf(Error);

            case 6:
              (0, _utils.restoreConsole)();

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
  });
});