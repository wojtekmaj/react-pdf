"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Ref = /*#__PURE__*/function () {
  function Ref(_ref) {
    var num = _ref.num,
        gen = _ref.gen;
    (0, _classCallCheck2["default"])(this, Ref);
    this.num = num;
    this.gen = gen;
  }

  (0, _createClass2["default"])(Ref, [{
    key: "toString",
    value: function toString() {
      var str = "".concat(this.num, "R");

      if (this.gen !== 0) {
        str += this.gen;
      }

      return str;
    }
  }]);
  return Ref;
}();

exports["default"] = Ref;