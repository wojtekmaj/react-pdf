import PropTypes from 'prop-types';

const fileTypes = [
  PropTypes.string,
  PropTypes.instanceOf(ArrayBuffer),
  PropTypes.shape({
    data: PropTypes.object,
    httpHeaders: PropTypes.object,
    range: PropTypes.object,
    url: PropTypes.string,
    withCredentials: PropTypes.bool,
  }),
];
if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

export const isFile = PropTypes.oneOfType(fileTypes);
