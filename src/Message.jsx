import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ children, type }) => (
  <div className={`react-pdf__message react-pdf__message--${type}`}>
    {children}
  </div>
);

Message.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired,
};

export default Message;
