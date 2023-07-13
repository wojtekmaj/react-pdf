import PropTypes from 'prop-types';
import { PDFDataRangeTransport } from 'pdfjs-dist';

const isTypedArray = PropTypes.oneOfType([
  PropTypes.instanceOf(Int8Array),
  PropTypes.instanceOf(Uint8Array),
  PropTypes.instanceOf(Uint8ClampedArray),
  PropTypes.instanceOf(Int16Array),
  PropTypes.instanceOf(Uint16Array),
  PropTypes.instanceOf(Int32Array),
  PropTypes.instanceOf(Uint32Array),
  PropTypes.instanceOf(Float32Array),
  PropTypes.instanceOf(Float64Array),
]);

const fileTypes = [
  PropTypes.string,
  PropTypes.instanceOf(ArrayBuffer),
  PropTypes.shape({
    data: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(ArrayBuffer),
      PropTypes.arrayOf(PropTypes.number.isRequired),
      isTypedArray,
    ]).isRequired,
  }),
  PropTypes.shape({
    range: PropTypes.instanceOf(PDFDataRangeTransport).isRequired,
  }),
  PropTypes.shape({
    url: PropTypes.string.isRequired,
  }),
];
if (typeof Blob !== 'undefined') {
  (fileTypes as PropTypes.Validator<unknown>[]).push(PropTypes.instanceOf(Blob));
}

export const isFile = PropTypes.oneOfType(fileTypes);
