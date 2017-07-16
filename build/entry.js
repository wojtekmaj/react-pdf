'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = exports.Document = undefined;

var _Document = require('./Document');

var _Document2 = _interopRequireDefault(_Document);

var _Page = require('./Page');

var _Page2 = _interopRequireDefault(_Page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');
require('pdfjs-dist');
require('pdfjs-dist/web/compatibility');

exports.Document = _Document2.default;
exports.Page = _Page2.default;