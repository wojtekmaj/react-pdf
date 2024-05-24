"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRotate = exports.isRenderMode = exports.isRef = exports.isPdf = exports.isPageNumber = exports.isPageIndex = exports.isPage = exports.isLinkTarget = exports.isLinkService = exports.isFile = exports.isClassName = exports.eventProps = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _makeEventProps = require("make-event-props");

var _utils = require("./utils");

var _LinkService = _interopRequireDefault(require("../LinkService"));

var eventProps = function () {
  var result = {};
  [].concat((0, _toConsumableArray2["default"])(_makeEventProps.mouseEvents), (0, _toConsumableArray2["default"])(_makeEventProps.touchEvents), (0, _toConsumableArray2["default"])(_makeEventProps.keyboardEvents)).forEach(function (eventName) {
    result[eventName] = _propTypes["default"].func;
  });
  return result;
}();

exports.eventProps = eventProps;
var fileTypes = [_propTypes["default"].string, _propTypes["default"].instanceOf(ArrayBuffer), _propTypes["default"].shape({
  data: _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].string]),
  httpHeaders: _propTypes["default"].object,
  range: _propTypes["default"].object,
  url: _propTypes["default"].string,
  withCredentials: _propTypes["default"].bool
})];

if (typeof File !== 'undefined') {
  fileTypes.push(_propTypes["default"].instanceOf(File));
}

if (typeof Blob !== 'undefined') {
  fileTypes.push(_propTypes["default"].instanceOf(Blob));
}

var isClassName = _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].arrayOf(_propTypes["default"].string)]);

exports.isClassName = isClassName;

var isFile = _propTypes["default"].oneOfType(fileTypes);

exports.isFile = isFile;

var isLinkService = _propTypes["default"].instanceOf(_LinkService["default"]);

exports.isLinkService = isLinkService;

var isLinkTarget = _propTypes["default"].oneOf(['_self', '_blank', '_parent', '_top']);

exports.isLinkTarget = isLinkTarget;

var isPage = _propTypes["default"].shape({
  _transport: _propTypes["default"].shape({
    fontLoader: _propTypes["default"].object.isRequired
  }).isRequired,
  commonObjs: _propTypes["default"].shape({
    _objs: _propTypes["default"].object.isRequired
  }).isRequired,
  getAnnotations: _propTypes["default"].func.isRequired,
  getTextContent: _propTypes["default"].func.isRequired,
  getViewport: _propTypes["default"].func.isRequired,
  render: _propTypes["default"].func.isRequired
});

exports.isPage = isPage;

var isPageIndex = function isPageIndex(props, propName, componentName) {
  var pageIndex = props[propName],
      pageNumber = props.pageNumber,
      pdf = props.pdf;

  if (!(0, _utils.isDefined)(pdf)) {
    return null;
  }

  if ((0, _utils.isDefined)(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error("`".concat(propName, "` of type `").concat((0, _typeof2["default"])(pageIndex), "` supplied to `").concat(componentName, "`, expected `number`."));
    }

    if (pageIndex < 0) {
      return new Error("Expected `".concat(propName, "` to be greater or equal to 0."));
    }

    var numPages = pdf.numPages;

    if (pageIndex + 1 > numPages) {
      return new Error("Expected `".concat(propName, "` to be less or equal to ").concat(numPages - 1, "."));
    }
  } else if (!(0, _utils.isDefined)(pageNumber)) {
    return new Error("`".concat(propName, "` not supplied. Either pageIndex or pageNumber must be supplied to `").concat(componentName, "`."));
  } // Everything is fine


  return null;
};

exports.isPageIndex = isPageIndex;

var isPageNumber = function isPageNumber(props, propName, componentName) {
  var pageNumber = props[propName],
      pageIndex = props.pageIndex,
      pdf = props.pdf;

  if (!(0, _utils.isDefined)(pdf)) {
    return null;
  }

  if ((0, _utils.isDefined)(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error("`".concat(propName, "` of type `").concat((0, _typeof2["default"])(pageNumber), "` supplied to `").concat(componentName, "`, expected `number`."));
    }

    if (pageNumber < 1) {
      return new Error("Expected `".concat(propName, "` to be greater or equal to 1."));
    }

    var numPages = pdf.numPages;

    if (pageNumber > numPages) {
      return new Error("Expected `".concat(propName, "` to be less or equal to ").concat(numPages, "."));
    }
  } else if (!(0, _utils.isDefined)(pageIndex)) {
    return new Error("`".concat(propName, "` not supplied. Either pageIndex or pageNumber must be supplied to `").concat(componentName, "`."));
  } // Everything is fine


  return null;
};

exports.isPageNumber = isPageNumber;

var isPdf = _propTypes["default"].oneOfType([_propTypes["default"].shape({
  getDestination: _propTypes["default"].func.isRequired,
  getOutline: _propTypes["default"].func.isRequired,
  getPage: _propTypes["default"].func.isRequired,
  numPages: _propTypes["default"].number.isRequired
}), _propTypes["default"].bool]);

exports.isPdf = isPdf;

var isRef = _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].shape({
  current: _propTypes["default"].any
})]);

exports.isRef = isRef;

var isRenderMode = _propTypes["default"].oneOf(['canvas', 'none', 'svg']);

exports.isRenderMode = isRenderMode;

var isRotate = _propTypes["default"].oneOf([0, 90, 180, 270]);

exports.isRotate = isRotate;