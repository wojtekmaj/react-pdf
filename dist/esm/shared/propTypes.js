import _typeof from "@babel/runtime/helpers/esm/typeof";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import PropTypes from 'prop-types';
import { mouseEvents, touchEvents, keyboardEvents } from 'make-event-props';
import { isDefined } from './utils';
import LinkService from '../LinkService';
export var eventProps = function () {
  var result = {};
  [].concat(_toConsumableArray(mouseEvents), _toConsumableArray(touchEvents), _toConsumableArray(keyboardEvents)).forEach(function (eventName) {
    result[eventName] = PropTypes.func;
  });
  return result;
}();
var fileTypes = [PropTypes.string, PropTypes.instanceOf(ArrayBuffer), PropTypes.shape({
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  httpHeaders: PropTypes.object,
  range: PropTypes.object,
  url: PropTypes.string,
  withCredentials: PropTypes.bool
})];

if (typeof File !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(File));
}

if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

export var isClassName = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);
export var isFile = PropTypes.oneOfType(fileTypes);
export var isLinkService = PropTypes.instanceOf(LinkService);
export var isLinkTarget = PropTypes.oneOf(['_self', '_blank', '_parent', '_top']);
export var isPage = PropTypes.shape({
  _transport: PropTypes.shape({
    fontLoader: PropTypes.object.isRequired
  }).isRequired,
  commonObjs: PropTypes.shape({
    _objs: PropTypes.object.isRequired
  }).isRequired,
  getAnnotations: PropTypes.func.isRequired,
  getTextContent: PropTypes.func.isRequired,
  getViewport: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired
});
export var isPageIndex = function isPageIndex(props, propName, componentName) {
  var pageIndex = props[propName],
      pageNumber = props.pageNumber,
      pdf = props.pdf;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error("`".concat(propName, "` of type `").concat(_typeof(pageIndex), "` supplied to `").concat(componentName, "`, expected `number`."));
    }

    if (pageIndex < 0) {
      return new Error("Expected `".concat(propName, "` to be greater or equal to 0."));
    }

    var numPages = pdf.numPages;

    if (pageIndex + 1 > numPages) {
      return new Error("Expected `".concat(propName, "` to be less or equal to ").concat(numPages - 1, "."));
    }
  } else if (!isDefined(pageNumber)) {
    return new Error("`".concat(propName, "` not supplied. Either pageIndex or pageNumber must be supplied to `").concat(componentName, "`."));
  } // Everything is fine


  return null;
};
export var isPageNumber = function isPageNumber(props, propName, componentName) {
  var pageNumber = props[propName],
      pageIndex = props.pageIndex,
      pdf = props.pdf;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error("`".concat(propName, "` of type `").concat(_typeof(pageNumber), "` supplied to `").concat(componentName, "`, expected `number`."));
    }

    if (pageNumber < 1) {
      return new Error("Expected `".concat(propName, "` to be greater or equal to 1."));
    }

    var numPages = pdf.numPages;

    if (pageNumber > numPages) {
      return new Error("Expected `".concat(propName, "` to be less or equal to ").concat(numPages, "."));
    }
  } else if (!isDefined(pageIndex)) {
    return new Error("`".concat(propName, "` not supplied. Either pageIndex or pageNumber must be supplied to `").concat(componentName, "`."));
  } // Everything is fine


  return null;
};
export var isPdf = PropTypes.oneOfType([PropTypes.shape({
  getDestination: PropTypes.func.isRequired,
  getOutline: PropTypes.func.isRequired,
  getPage: PropTypes.func.isRequired,
  numPages: PropTypes.number.isRequired
}), PropTypes.bool]);
export var isRef = PropTypes.oneOfType([PropTypes.func, PropTypes.shape({
  current: PropTypes.any
})]);
export var isRenderMode = PropTypes.oneOf(['canvas', 'none', 'svg']);
export var isRotate = PropTypes.oneOf([0, 90, 180, 270]);