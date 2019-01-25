"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "pdfjs", {
  enumerable: true,
  get: function get() {
    return _pdfjsDist.default;
  }
});
Object.defineProperty(exports, "Document", {
  enumerable: true,
  get: function get() {
    return _Document.default;
  }
});
Object.defineProperty(exports, "Outline", {
  enumerable: true,
  get: function get() {
    return _Outline.default;
  }
});
Object.defineProperty(exports, "Page", {
  enumerable: true,
  get: function get() {
    return _Page.default;
  }
});

var _pdfjsDist = _interopRequireDefault(require("pdfjs-dist"));

var _Document = _interopRequireDefault(require("./Document"));

var _Outline = _interopRequireDefault(require("./Outline"));

var _Page = _interopRequireDefault(require("./Page"));

require("./pdf.worker.entry");