"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _enzyme = require("enzyme");

var _entry = require("../../entry.jest");

var _AnnotationLayer = require("../AnnotationLayer");

var _LinkService = _interopRequireDefault(require("../../LinkService"));

var _failing_page = _interopRequireDefault(require("../../../__mocks__/_failing_page"));

var _utils = require("../../__tests__/utils");

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n      linkServiceTarget | target\n      ", "              | ", "\n      ", "              | ", "\n      ", "              | ", "\n      ", "              | ", "\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var pdfFile = (0, _utils.loadPDF)('./__mocks__/_pdf.pdf');
/* eslint-disable comma-dangle */

describe('AnnotationLayer', function () {
  var linkService = new _LinkService["default"](); // Loaded page

  var page;
  var page2; // Loaded page text items

  var desiredAnnotations;
  var desiredAnnotations2;
  beforeAll(
  /*#__PURE__*/
  (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var pdf;
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
            return page.getAnnotations();

          case 8:
            desiredAnnotations = _context.sent;
            _context.next = 11;
            return pdf.getPage(2);

          case 11:
            page2 = _context.sent;
            _context.next = 14;
            return page2.getAnnotations();

          case 14:
            desiredAnnotations2 = _context.sent;

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  describe('loading', function () {
    it('loads annotations and calls onGetAnnotationsSuccess callback properly',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2() {
      var _makeAsyncCallback, onGetAnnotationsSuccess, onGetAnnotationsSuccessPromise;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _makeAsyncCallback = (0, _utils.makeAsyncCallback)(), onGetAnnotationsSuccess = _makeAsyncCallback.func, onGetAnnotationsSuccessPromise = _makeAsyncCallback.promise;
              (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onGetAnnotationsSuccess: onGetAnnotationsSuccess,
                page: page
              }));
              expect.assertions(1);
              _context2.next = 5;
              return expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));
    it('calls onGetAnnotationsError when failed to load annotations',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3() {
      var _makeAsyncCallback2, onGetAnnotationsError, onGetAnnotationsErrorPromise;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _makeAsyncCallback2 = (0, _utils.makeAsyncCallback)(), onGetAnnotationsError = _makeAsyncCallback2.func, onGetAnnotationsErrorPromise = _makeAsyncCallback2.promise;
              (0, _utils.muteConsole)();
              (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onGetAnnotationsError: onGetAnnotationsError,
                page: _failing_page["default"]
              }));
              expect.assertions(1);
              _context3.next = 6;
              return expect(onGetAnnotationsErrorPromise).resolves.toBeInstanceOf(Error);

            case 6:
              (0, _utils.restoreConsole)();

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
    it('replaces annotations properly when page is changed',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      var _makeAsyncCallback3, onGetAnnotationsSuccess, onGetAnnotationsSuccessPromise, mountedComponent, _makeAsyncCallback4, onGetAnnotationsSuccess2, onGetAnnotationsSuccessPromise2;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _makeAsyncCallback3 = (0, _utils.makeAsyncCallback)(), onGetAnnotationsSuccess = _makeAsyncCallback3.func, onGetAnnotationsSuccessPromise = _makeAsyncCallback3.promise;
              mountedComponent = (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onGetAnnotationsSuccess: onGetAnnotationsSuccess,
                page: page
              }));
              expect.assertions(2);
              _context4.next = 5;
              return expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);

            case 5:
              _makeAsyncCallback4 = (0, _utils.makeAsyncCallback)(), onGetAnnotationsSuccess2 = _makeAsyncCallback4.func, onGetAnnotationsSuccessPromise2 = _makeAsyncCallback4.promise;
              mountedComponent.setProps({
                onGetAnnotationsSuccess: onGetAnnotationsSuccess2,
                page: page2
              });
              _context4.next = 9;
              return expect(onGetAnnotationsSuccessPromise2).resolves.toMatchObject(desiredAnnotations2);

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
        return (0, _enzyme.shallow)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, null));
      }).toThrow();
      (0, _utils.restoreConsole)();
    });
  });
  describe('rendering', function () {
    it('renders annotations properly',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee5() {
      var _makeAsyncCallback5, onRenderAnnotationLayerSuccess, onRenderAnnotationLayerSuccessPromise, component;

      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _makeAsyncCallback5 = (0, _utils.makeAsyncCallback)(), onRenderAnnotationLayerSuccess = _makeAsyncCallback5.func, onRenderAnnotationLayerSuccessPromise = _makeAsyncCallback5.promise;
              component = (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
                page: page
              }));
              expect.assertions(1);
              return _context5.abrupt("return", onRenderAnnotationLayerSuccessPromise.then(function () {
                component.update();
                var renderedLayer = component.getDOMNode();
                var annotationItems = (0, _toConsumableArray2["default"])(renderedLayer.children);
                expect(annotationItems).toHaveLength(desiredAnnotations.length);
              }));

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));
    /* eslint-disable indent */

    it.each(_templateObject(), 1, '_self', 2, '_blank', 3, '_parent', 4, '_top')('renders all links with target $target given externalLinkTarget = $target', function (_ref6) {
      var linkServiceTarget = _ref6.linkServiceTarget,
          target = _ref6.target;

      var _makeAsyncCallback6 = (0, _utils.makeAsyncCallback)(),
          onRenderAnnotationLayerSuccess = _makeAsyncCallback6.func,
          onRenderAnnotationLayerSuccessPromise = _makeAsyncCallback6.promise;

      var customLinkService = new _LinkService["default"]();
      customLinkService.externalLinkTarget = linkServiceTarget;
      var component = (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
        linkService: customLinkService,
        onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
        page: page
      }));
      expect.assertions(desiredAnnotations.length);
      return onRenderAnnotationLayerSuccessPromise.then(function () {
        component.update();
        var renderedLayer = component.getDOMNode();
        var annotationItems = (0, _toConsumableArray2["default"])(renderedLayer.children);
        var annotationLinkItems = annotationItems.map(function (item) {
          return item.firstChild;
        }).filter(function (item) {
          return item.tagName === 'A';
        });
        annotationLinkItems.forEach(function (link) {
          return expect(link.getAttribute('target')).toBe(target);
        });
      });
    });
    /* eslint-enable indent */

    it('renders annotations at a given rotation',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6() {
      var _makeAsyncCallback7, onRenderAnnotationLayerSuccess, onRenderAnnotationLayerSuccessPromise, rotate, component;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _makeAsyncCallback7 = (0, _utils.makeAsyncCallback)(), onRenderAnnotationLayerSuccess = _makeAsyncCallback7.func, onRenderAnnotationLayerSuccessPromise = _makeAsyncCallback7.promise;
              rotate = 90;
              component = (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
                page: page,
                rotate: rotate
              }));
              expect.assertions(1);
              return _context6.abrupt("return", onRenderAnnotationLayerSuccessPromise.then(function () {
                component.update();

                var _component$instance = component.instance(),
                    viewport = _component$instance.viewport;

                expect(viewport.rotation).toEqual(rotate);
              }));

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    })));
    it('renders annotations at a given scale',
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee7() {
      var _makeAsyncCallback8, onRenderAnnotationLayerSuccess, onRenderAnnotationLayerSuccessPromise, scale, component;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _makeAsyncCallback8 = (0, _utils.makeAsyncCallback)(), onRenderAnnotationLayerSuccess = _makeAsyncCallback8.func, onRenderAnnotationLayerSuccessPromise = _makeAsyncCallback8.promise;
              scale = 2;
              component = (0, _enzyme.mount)(_react["default"].createElement(_AnnotationLayer.AnnotationLayerInternal, {
                linkService: linkService,
                onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
                page: page,
                scale: scale
              }));
              expect.assertions(1);
              return _context7.abrupt("return", onRenderAnnotationLayerSuccessPromise.then(function () {
                component.update();

                var _component$instance2 = component.instance(),
                    viewport = _component$instance2.viewport;

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