"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFromFile = exports.isCancelException = exports.makePageCallback = exports.cancelRunningTask = exports.makeCancellable = exports.displayCORSWarning = exports.errorOnDev = exports.warnOnDev = exports.getPixelRatio = exports.callIfDefined = exports.dataURItoUint8Array = exports.isDataURI = exports.isFile = exports.isBlob = exports.isArrayBuffer = exports.isString = exports.isProvided = exports.isDefined = exports.isProduction = exports.isLocalFileSystem = exports.isBrowser = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

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
 * Checks whether we're running on a production build or not.
 */

exports.isLocalFileSystem = isLocalFileSystem;
var isProduction = process.env.NODE_ENV === 'production';
/**
 * Checks whether a variable is defined.
 *
 * @param {*} variable Variable to check
 */

exports.isProduction = isProduction;

var isDefined = function isDefined(variable) {
  return typeof variable !== 'undefined';
};
/**
 * Checks whether a variable is defined and not null.
 *
 * @param {*} variable Variable to check
 */


exports.isDefined = isDefined;

var isProvided = function isProvided(variable) {
  return isDefined(variable) && variable !== null;
};
/**
 * Checkes whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */


exports.isProvided = isProvided;

var isString = function isString(variable) {
  return typeof variable === 'string';
};
/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */


exports.isString = isString;

var isArrayBuffer = function isArrayBuffer(variable) {
  return variable instanceof ArrayBuffer;
};
/**
 * Checkes whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */


exports.isArrayBuffer = isArrayBuffer;

var isBlob = function isBlob(variable) {
  if (!isBrowser) {
    throw new Error('Attempted to check if a variable is a Blob on a non-browser environment.');
  }

  return variable instanceof Blob;
};
/**
 * Checkes whether a variable provided is a File.
 *
 * @param {*} variable Variable to check
 */


exports.isBlob = isBlob;

var isFile = function isFile(variable) {
  if (!isBrowser) {
    throw new Error('Attempted to check if a variable is a File on a non-browser environment.');
  }

  return variable instanceof File;
};
/**
 * Checks whether a string provided is a data URI.
 *
 * @param {String} str String to check
 */


exports.isFile = isFile;

var isDataURI = function isDataURI(str) {
  return isString(str) && /^data:/.test(str);
};

exports.isDataURI = isDataURI;

var dataURItoUint8Array = function dataURItoUint8Array(dataURI) {
  if (!isDataURI(dataURI)) {
    throw new Error('dataURItoUint8Array was provided with an argument which is not a valid data URI.');
  }

  var byteString;

  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  var ia = new Uint8Array(byteString.length);

  for (var i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
};
/**
 * Calls a function, if it's defined, with specified arguments
 * @param {Function} fn
 * @param {Object} args
 */


exports.dataURItoUint8Array = dataURItoUint8Array;

var callIfDefined = function callIfDefined(fn) {
  if (fn && typeof fn === 'function') {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    fn.apply(void 0, args);
  }
};

exports.callIfDefined = callIfDefined;

var getPixelRatio = function getPixelRatio() {
  return isBrowser && window.devicePixelRatio || 1;
};

exports.getPixelRatio = getPixelRatio;

var consoleOnDev = function consoleOnDev(method) {
  if (!isProduction) {
    var _console;

    for (var _len2 = arguments.length, message = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      message[_key2 - 1] = arguments[_key2];
    }

    // eslint-disable-next-line no-console
    (_console = console)[method].apply(_console, message);
  }
};

var warnOnDev = function warnOnDev() {
  for (var _len3 = arguments.length, message = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    message[_key3] = arguments[_key3];
  }

  return consoleOnDev.apply(void 0, ['warn'].concat(message));
};

exports.warnOnDev = warnOnDev;

var errorOnDev = function errorOnDev() {
  for (var _len4 = arguments.length, message = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    message[_key4] = arguments[_key4];
  }

  return consoleOnDev.apply(void 0, ['error'].concat(message));
};

exports.errorOnDev = errorOnDev;

var displayCORSWarning = function displayCORSWarning() {
  if (isLocalFileSystem) {
    warnOnDev('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
  }
};

exports.displayCORSWarning = displayCORSWarning;

var PromiseCancelledException =
/*#__PURE__*/
function (_Error) {
  (0, _inherits2.default)(PromiseCancelledException, _Error);

  function PromiseCancelledException(message, type) {
    var _this;

    (0, _classCallCheck2.default)(this, PromiseCancelledException);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PromiseCancelledException).call(this, message, type));
    _this.name = 'PromiseCancelledException';
    _this.message = message;
    _this.type = type;
    return _this;
  }

  return PromiseCancelledException;
}((0, _wrapNativeSuper2.default)(Error));

var makeCancellable = function makeCancellable(promise) {
  var isCancelled = false;
  var wrappedPromise = new Promise(function (resolve, reject) {
    promise.then(function () {
      return isCancelled ? reject(new PromiseCancelledException('Promise cancelled')) : resolve.apply(void 0, arguments);
    }, function (error) {
      return isCancelled ? reject(new PromiseCancelledException('Promise cancelled')) : reject(error);
    });
  });
  return {
    promise: wrappedPromise,
    cancel: function cancel() {
      isCancelled = true;
    }
  };
};

exports.makeCancellable = makeCancellable;

var cancelRunningTask = function cancelRunningTask(runningTask) {
  if (!runningTask || !runningTask.cancel) {
    return;
  }

  runningTask.cancel();
};

exports.cancelRunningTask = cancelRunningTask;

var makePageCallback = function makePageCallback(page, scale) {
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
};

exports.makePageCallback = makePageCallback;

var isCancelException = function isCancelException(error) {
  return error.name === 'RenderingCancelledException' || error.name === 'PromiseCancelledException';
};

exports.isCancelException = isCancelException;

var loadFromFile = function loadFromFile(file) {
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
};

exports.loadFromFile = loadFromFile;