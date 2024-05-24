"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Document", {
  enumerable: true,
  get: function get() {
    return _Document["default"];
  }
});
Object.defineProperty(exports, "Outline", {
  enumerable: true,
  get: function get() {
    return _Outline["default"];
  }
});
Object.defineProperty(exports, "Page", {
  enumerable: true,
  get: function get() {
    return _Page["default"];
  }
});
exports.pdfjs = void 0;

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

exports.pdfjs = pdfjs;

var _Document = _interopRequireDefault(require("./Document"));

var _Outline = _interopRequireDefault(require("./Outline"));

var _Page = _interopRequireDefault(require("./Page"));

var _utils = require("./shared/utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(0, _utils.displayWorkerWarning)();
pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';