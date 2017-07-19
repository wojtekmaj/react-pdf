'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = exports.Outline = exports.Document = undefined;

var _Document = require('./Document');

var _Document2 = _interopRequireDefault(_Document);

var _Outline = require('./Outline');

var _Outline2 = _interopRequireDefault(_Outline);

var _Page = require('./Page');

var _Page2 = _interopRequireDefault(_Page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pdfjs = require('pdfjs-dist/build/pdf.combined');
require('pdfjs-dist/web/compatibility');

pdfjs.PDFJS.disableWorker = true;

exports.Document = _Document2.default;
exports.Outline = _Outline2.default;
exports.Page = _Page2.default;