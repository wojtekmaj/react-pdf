"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _react = _interopRequireDefault(require("react"));

var _enzyme = require("enzyme");

var _entry = require("../../entry.jest");

var _TextLayerItem = require("../TextLayerItem");

var _utils = require("../../__tests__/utils");

var pdfFile = (0, _utils.loadPDF)('./__mocks__/_pdf.pdf');
/* eslint-disable comma-dangle */

describe('TextLayerItem', function () {
  // Loaded page
  var page;
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

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  var defaultProps = {
    fontName: '',
    itemIndex: 0,
    str: 'Test',
    transform: [],
    width: 0
  };
  describe('rendering', function () {
    it('renders text content properly', function () {
      var str = 'Test string';
      var component = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayerItem.TextLayerItemInternal, (0, _extends2["default"])({}, defaultProps, {
        page: page,
        str: str
      })));
      var textItem = component.text();
      expect(textItem).toEqual(str);
    });
    it('calls customTextRenderer with necessary arguments', function () {
      var customTextRenderer = jest.fn();
      var str = 'Test string';
      var itemIndex = 5;
      (0, _enzyme.shallow)(_react["default"].createElement(_TextLayerItem.TextLayerItemInternal, (0, _extends2["default"])({}, defaultProps, {
        customTextRenderer: customTextRenderer,
        itemIndex: itemIndex,
        page: page,
        str: str
      })));
      expect(customTextRenderer).toHaveBeenCalledWith(expect.objectContaining({
        str: str,
        itemIndex: itemIndex
      }));
    });
    it('renders text content properly given customTextRenderer', function () {
      var customTextRenderer = function customTextRenderer() {
        return 'Test value';
      };

      var component = (0, _enzyme.shallow)(_react["default"].createElement(_TextLayerItem.TextLayerItemInternal, (0, _extends2["default"])({}, defaultProps, {
        customTextRenderer: customTextRenderer,
        page: page
      })));
      var textItem = component.text();
      expect(textItem).toEqual('Test value');
    });
  });
});