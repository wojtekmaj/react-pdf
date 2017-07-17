'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Checks if we're running in a browser environment.
 */
var isBrowser = exports.isBrowser = function isBrowser() {
  return typeof window !== 'undefined';
};

/**
 * Checks whether we're running from a local file system.
 */
var isLocalFileSystem = exports.isLocalFileSystem = function isLocalFileSystem() {
  return isBrowser() && window.location.protocol === 'file:';
};

/**
 * Checks whether a variable is defined.
 *
 * @param {*} variable Variable to check
 */
var isDefined = exports.isDefined = function isDefined(variable) {
  return typeof variable !== 'undefined';
};

/**
 * Checks whether a variable is defined and not null.
 *
 * @param {*} variable Variable to check
 */
var isProvided = exports.isProvided = function isProvided(variable) {
  return isDefined(variable) && variable !== null;
};

/**
 * Checkes whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */
var isString = exports.isString = function isString(variable) {
  return typeof variable === 'string';
};

/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */
var isArrayBuffer = exports.isArrayBuffer = function isArrayBuffer(variable) {
  return variable instanceof ArrayBuffer;
};

/**
 * Checkes whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */
var isBlob = exports.isBlob = function isBlob(variable) {
  if (!isBrowser()) {
    throw new Error('Attempted to check if a variable is a Blob on a non-browser environment.');
  }

  return variable instanceof Blob;
};

/**
 * Checkes whether a variable provided is a File.
 *
 * @param {*} variable Variable to check
 */
var isFile = exports.isFile = function isFile(variable) {
  if (!isBrowser()) {
    throw new Error('Attempted to check if a variable is a Blob on a non-browser environment.');
  }

  return variable instanceof File;
};

/**
 * Checks whether a string provided is a data URI.
 *
 * @param {String} str String to check
 */
var isDataURI = exports.isDataURI = function isDataURI(str) {
  return isString(str) && /^data:/.test(str);
};

var isParamObject = exports.isParamObject = function isParamObject(file) {
  return file instanceof Object && ('data' in file || 'range' in file || 'url' in file);
};

/**
 * Parses data URI to Blob.
 *
 * @param {String} dataURI
 */
var dataURItoBlob = exports.dataURItoBlob = function dataURItoBlob(dataURI) {
  if (!isDataURI(dataURI)) {
    throw new Error('getDataURItoBlob was provided with an argument which is not a valid data URI.');
  }

  var byteString = void 0;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};

/**
 * Creates an URL of a Blob.
 *
 * @param {Blob} blob Blob from which an URL shall be created
 */
var getBlobURL = exports.getBlobURL = function getBlobURL(blob) {
  if (!isBlob(blob)) {
    throw new Error('getBlobURL was provided with an argument which is not a Blob.');
  }

  return URL.createObjectURL(blob);
};

var dataURItoURL = exports.dataURItoURL = function dataURItoURL(dataURI) {
  return getBlobURL(dataURItoBlob(dataURI));
};

/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */
var callIfDefined = exports.callIfDefined = function callIfDefined(fn, args) {
  if (fn && typeof fn === 'function') {
    fn(args);
  }
};

var getPixelRatio = exports.getPixelRatio = function getPixelRatio() {
  return window.devicePixelRatio || 1;
};

var fontOffsetCache = {};

/**
 * Measures the distance in percent between font's baseline and descender.
 *
 * @param {HTMLElement} container Container in which measurements shall be made.
 */
var measureFontOffset = exports.measureFontOffset = function measureFontOffset(fontFamily) {
  if (!isDefined(fontOffsetCache[fontFamily])) {
    var div = document.createElement('div');
    var strut = document.createElement('span');

    div.style.position = 'absolute';
    div.style.fontFamily = fontFamily;

    strut.textContent = 'T';
    strut.style.lineHeight = 0;

    div.appendChild(strut);
    document.body.appendChild(div);

    var result = div.offsetHeight / strut.offsetHeight - 1;

    fontOffsetCache[fontFamily] = result;

    div.parentNode.removeChild(div);
  }

  return fontOffsetCache[fontFamily];
};