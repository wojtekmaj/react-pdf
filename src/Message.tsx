import React from 'react';
import PropTypes from 'prop-types';

type MessageProps = {
  children: React.ReactNode;
  type: 'error' | 'loading' | 'no-data';
};

export default function Message({ children, type }: MessageProps) {
  return <div className={`react-pdf__message react-pdf__message--${type}`}>{children}</div>;
}

Message.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired,
};
