"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cancelRunningTask = cancelRunningTask;
exports.dataURItoByteString = dataURItoByteString;
exports.displayCORSWarning = displayCORSWarning;
exports.displayWorkerWarning = displayWorkerWarning;
exports.getPixelRatio = getPixelRatio;
exports.isArrayBuffer = isArrayBuffer;
exports.isBlob = isBlob;
exports.isBrowser = void 0;
exports.isCancelException = isCancelException;
exports.isDataURI = isDataURI;
exports.isDefined = isDefined;
exports.isFile = isFile;
exports.isLocalFileSystem = void 0;
exports.isProvided = isProvided;
exports.isString = isString;
exports.loadFromFile = loadFromFile;
exports.makePageCallback = makePageCallback;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));

var _tinyWarning = _interopRequireDefault(require("tiny-warning"));

/**
 * Checks if we're running in a browser environment.
 */
var isBrowser = typeof window !== 'undefined';
/**
 * Checks whether we're running from a local file system.
 */

exports.isBrowser = isBrowser;
var isLocalFileSystem = isBrowser && window.location.protocol === 'file:';
/**
 * Checks whether a variable is defined.
 *
 * @param {*} variable Variable to check
 */

exports.isLocalFileSystem = isLocalFileSystem;

function isDefined(variable) {
  return typeof variable !== 'undefined';
}
/**
 * Checks whether a variable is defined and not null.
 *
 * @param {*} variable Variable to check
 */


function isProvided(variable) {
  return isDefined(variable) && variable !== null;
}
/**
 * Checkes whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */


function isString(variable) {
  return typeof variable === 'string';
}
/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */


function isArrayBuffer(variable) {
  return variable instanceof ArrayBuffer;
}
/**
 * Checkes whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */


function isBlob(variable) {
  (0, _tinyInvariant["default"])(isBrowser, 'isBlob can only be used in a browser environment');
  return variable instanceof Blob;
}
/**
 * Checkes whether a variable provided is a File.
 *
 * @param {*} variable Variable to check
 */


function isFile(variable) {
  (0, _tinyInvariant["default"])(isBrowser, 'isFile can only be used in a browser environment');
  return variable instanceof File;
}
/**
 * Checks whether a string provided is a data URI.
 *
 * @param {string} str String to check
 */


function isDataURI(str) {
  return isString(str) && /^data:/.test(str);
}

function dataURItoByteString(dataURI) {
  (0, _tinyInvariant["default"])(isDataURI(dataURI), 'Invalid data URI.');

  var _dataURI$split = dataURI.split(','),
      _dataURI$split2 = (0, _slicedToArray2["default"])(_dataURI$split, 2),
      headersString = _dataURI$split2[0],
      dataString = _dataURI$split2[1];

  var headers = headersString.split(';');

  if (headers.indexOf('base64') !== -1) {
    return atob(dataString);
  }

  return unescape(dataString);
}

function getPixelRatio() {
  return isBrowser && window.devicePixelRatio || 1;
}

var allowFileAccessFromFilesTip = 'On Chromium based browsers, you can use --allow-file-access-from-files flag for debugging purposes.';

function displayCORSWarning() {
  (0, _tinyWarning["default"])(!isLocalFileSystem, "Loading PDF as base64 strings/URLs may not work on protocols other than HTTP/HTTPS. ".concat(allowFileAccessFromFilesTip));
}

function displayWorkerWarning() {
  (0, _tinyWarning["default"])(!isLocalFileSystem, "Loading PDF.js worker may not work on protocols other than HTTP/HTTPS. ".concat(allowFileAccessFromFilesTip));
}

function cancelRunningTask(runningTask) {
  if (runningTask && runningTask.cancel) runningTask.cancel();
}

function makePageCallback(page, scale) {
  Object.defineProperty(page, 'width', {
    get: function get() {
      return this.view[2] * scale;
    },
    configurable: true
  });
  Object.defineProperty(page, 'height', {
    get: function get() {
      return this.view[3] * scale;
    },
    configurable: true
  });
  Object.defineProperty(page, 'originalWidth', {
    get: function get() {
      return this.view[2];
    },
    configurable: true
  });
  Object.defineProperty(page, 'originalHeight', {
    get: function get() {
      return this.view[3];
    },
    configurable: true
  });
  return page;
}

function isCancelException(error) {
  return error.name === 'RenderingCancelledException';
}

function loadFromFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function () {
      return resolve(new Uint8Array(reader.result));
    };

    reader.onerror = function (event) {
      switch (event.target.error.code) {
        case event.target.error.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'));

        case event.target.error.NOT_READABLE_ERR:
          return reject(new Error('Error while reading a file: File not readable.'));

        case event.target.error.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'));

        case event.target.error.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'));

        default:
          return reject(new Error('Error while reading a file.'));
      }
    };

    reader.readAsArrayBuffer(file);
    return null;
  });
}