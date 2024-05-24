import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";

var Ref = /*#__PURE__*/function () {
  function Ref(_ref) {
    var num = _ref.num,
        gen = _ref.gen;

    _classCallCheck(this, Ref);

    this.num = num;
    this.gen = gen;
  }

  _createClass(Ref, [{
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

export { Ref as default };