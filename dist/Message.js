"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var Message = function Message(_ref) {
  var children = _ref.children,
      type = _ref.type;
  return _react.default.createElement("div", {
    className: "react-pdf__message react-pdf__message--".concat(type)
  }, children);
};

Message.propTypes = {
  children: _propTypes.default.node,
  type: _propTypes.default.oneOf(['error', 'loading', 'no-data']).isRequired
};
var _default = Message;
exports.default = _default;