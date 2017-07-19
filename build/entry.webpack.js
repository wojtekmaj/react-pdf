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

var _util = require('./shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_util.isLocalFileSystem) {
  // eslint-disable-next-line no-console
  (0, _util.warnOnDev)('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

require('pdfjs-dist/webpack');
require('pdfjs-dist/web/compatibility');

exports.Document = _Document2.default;
exports.Outline = _Outline2.default;
exports.Page = _Page2.default;