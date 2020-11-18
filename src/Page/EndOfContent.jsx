import React, { forwardRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isRef } from '../shared/propTypes';

class EndOfContentInternal extends PureComponent {
  render() {
    const { forwardedRef, top } = this.props;
    return (
      <div
        ref={forwardedRef}
        style={{
          display: 'block',
          position: 'absolute',
          left: 0,
          top,
          right: 0,
          bottom: 0,
          zIndex: -1,
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
        }}
      />
    );
  }
}

EndOfContentInternal.propTypes = {
  forwardedRef: isRef,
  top: PropTypes.string,
};

function EndOfContent(props, ref) {
  return <EndOfContentInternal {...props} forwardedRef={ref} />;
}

export default forwardRef(EndOfContent);
