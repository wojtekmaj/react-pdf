import React from 'react';
import PropTypes from 'prop-types';
export default function Message(_ref) {
  var children = _ref.children,
    type = _ref.type;
  return /*#__PURE__*/React.createElement("div", {
    className: "react-pdf__message react-pdf__message--".concat(type)
  }, children);
}
Message.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired
};