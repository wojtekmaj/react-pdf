"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _enzyme = require("enzyme");

var _entry = require("../../entry.jest");

var _TextLayer = require("../TextLayer");

var _failing_page = _interopRequireDefault(require("../../../__mocks__/_failing_page"));

var _utils = require("../../__tests__/utils");

var pdfFile = (0, _utils.loadPDF)('./__mocks__/_pdf.pdf');
/* eslint-disable comma-dangle */

describe('TextLayer', function () {
  // Loaded page
  var page;
  var page2; // Loaded page text items

  var desiredTextItems;
  var desiredTextItems2;
  beforeAll(
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var pdf, textContent, textContent2;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _entry.pdfjs.getDocument({
              data: pdfFile.arrayBuffer
            }).promise;

          case 2:
            pdf = _context.sent;
            _context.next = 5;
            return pdf.getPage(1);

          case 5:
            page = _context.sent;
            _context.next = 8;
            return page.getTextContent();

          case 8:
            textContent = _context.sent;
            desiredTextItems = textContent.items;
            _context.next = 12;
            return pdf.getPage(2);

          case 12:
            page2 = _context.sent;
            _context.next = 15;
            return page2.getTextContent();

          case 15:
            textContent2 = _context.sent;
            desiredTextItems2 = textContent2.items;

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  describe('loading', function () {
    it('loads text content and calls onGetTextSuccess callback properly',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2() {
      var _makeAsyncCallback, onGetTextSuccess, onGetTextSuccessPromise;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _makeAsyncCallback = (0, _utils.makeAsyncCallback)(), onGetTextSuccess = _makeAsyncCallback.func, onGetTextSuccessPromise = _makeAsyncCallback.promise;
              (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextSuccess: onGetTextSuccess,
                page: page
              }));
              expect.assertions(1);
              _context2.next = 5;
              return expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));
    it('calls onGetTextError when failed to load text content',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3() {
      var _makeAsyncCallback2, onGetTextError, onGetTextErrorPromise;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _makeAsyncCallback2 = (0, _utils.makeAsyncCallback)(), onGetTextError = _makeAsyncCallback2.func, onGetTextErrorPromise = _makeAsyncCallback2.promise;
              (0, _utils.muteConsole)();
              (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextError: onGetTextError,
                page: _failing_page["default"]
              }));
              expect.assertions(1);
              _context3.next = 6;
              return expect(onGetTextErrorPromise).resolves.toBeInstanceOf(Error);

            case 6:
              (0, _utils.restoreConsole)();

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
    it('replaces text content properly',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      var _makeAsyncCallback3, onGetTextSuccess, onGetTextSuccessPromise, mountedComponent, _makeAsyncCallback4, onGetTextSuccess2, onGetTextSuccessPromise2;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _makeAsyncCallback3 = (0, _utils.makeAsyncCallback)(), onGetTextSuccess = _makeAsyncCallback3.func, onGetTextSuccessPromise = _makeAsyncCallback3.promise;
              mountedComponent = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextSuccess: onGetTextSuccess,
                page: page
              }));
              expect.assertions(2);
              _context4.next = 5;
              return expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);

            case 5:
              _makeAsyncCallback4 = (0, _utils.makeAsyncCallback)(), onGetTextSuccess2 = _makeAsyncCallback4.func, onGetTextSuccessPromise2 = _makeAsyncCallback4.promise;
              mountedComponent.setProps({
                onGetTextSuccess: onGetTextSuccess2,
                page: page2
              });
              _context4.next = 9;
              return expect(onGetTextSuccessPromise2).resolves.toMatchObject(desiredTextItems2);

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    })));
    it('throws an error when placed outside Page', function () {
      (0, _utils.muteConsole)();
      expect(function () {
        return (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, null));
      }).toThrow();
      (0, _utils.restoreConsole)();
    });
  });
  describe('rendering', function () {
    it('renders text content properly',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee5() {
      var _makeAsyncCallback5, onGetTextSuccess, onGetTextSuccessPromise, component;

      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _makeAsyncCallback5 = (0, _utils.makeAsyncCallback)(), onGetTextSuccess = _makeAsyncCallback5.func, onGetTextSuccessPromise = _makeAsyncCallback5.promise;
              component = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextSuccess: onGetTextSuccess,
                page: page
              }));
              expect.assertions(1);
              return _context5.abrupt("return", onGetTextSuccessPromise.then(function () {
                component.update();
                var textItems = component.children();
                expect(textItems).toHaveLength(desiredTextItems.length);
              }));

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));
    it('renders text content at a given rotation',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6() {
      var _makeAsyncCallback6, onGetTextSuccess, onGetTextSuccessPromise, rotate, component;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _makeAsyncCallback6 = (0, _utils.makeAsyncCallback)(), onGetTextSuccess = _makeAsyncCallback6.func, onGetTextSuccessPromise = _makeAsyncCallback6.promise;
              rotate = 90;
              component = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextSuccess: onGetTextSuccess,
                page: page,
                rotate: rotate
              }));
              expect.assertions(1);
              return _context6.abrupt("return", onGetTextSuccessPromise.then(function () {
                component.update();

                var _component$instance = component.instance(),
                    instanceRotate = _component$instance.rotate;

                expect(instanceRotate).toEqual(rotate);
              }));

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    })));
    it('renders text content at a given scale',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee7() {
      var _makeAsyncCallback7, onGetTextSuccess, onGetTextSuccessPromise, scale, component;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _makeAsyncCallback7 = (0, _utils.makeAsyncCallback)(), onGetTextSuccess = _makeAsyncCallback7.func, onGetTextSuccessPromise = _makeAsyncCallback7.promise;
              scale = 2;
              component = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayer.TextLayerInternal, {
                onGetTextSuccess: onGetTextSuccess,
                page: page,
                scale: scale
              }));
              expect.assertions(1);
              return _context7.abrupt("return", onGetTextSuccessPromise.then(function () {
                component.update();

                var _component$instance2 = component.instance(),
                    viewport = _component$instance2.unrotatedViewport;

                expect(viewport.scale).toEqual(scale);
              }));

            case 5:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    })));
  });
});