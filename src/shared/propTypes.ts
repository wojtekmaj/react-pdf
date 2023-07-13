import PropTypes from 'prop-types';
import { allEvents } from 'make-event-props';
import { PDFDataRangeTransport } from 'pdfjs-dist';

import { isDefined } from './utils';

import LinkService from '../LinkService';

import type { Validator } from 'prop-types';

type AllEvents = (typeof allEvents)[number];

type Props = {
  [K in AllEvents]?: typeof PropTypes.func;
};

export const eventProps: Props = (() => {
  const result: Props = {};

  allEvents.forEach((eventName) => {
    result[eventName] = PropTypes.func;
  });

  return result;
})();

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

export const isClassName = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
]);

export const isFile = PropTypes.oneOfType(fileTypes);

export const isLinkService = PropTypes.instanceOf(LinkService);

export const isLinkTarget = PropTypes.oneOf(['_self', '_blank', '_parent', '_top']);

export const isPage = PropTypes.shape({
  commonObjs: PropTypes.shape({}).isRequired,
  getAnnotations: PropTypes.func.isRequired,
  getTextContent: PropTypes.func.isRequired,
  getViewport: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
});

export const isPageIndex: Validator<number> = function isPageIndex(props, propName, componentName) {
  const { [propName]: pageIndex, pageNumber, pdf } = props;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error(
        `\`${propName}\` of type \`${typeof pageIndex}\` supplied to \`${componentName}\`, expected \`number\`.`,
      );
    }

    if (pageIndex < 0) {
      return new Error(`Expected \`${propName}\` to be greater or equal to 0.`);
    }

    const { numPages } = pdf;

    if (pageIndex + 1 > numPages) {
      return new Error(`Expected \`${propName}\` to be less or equal to ${numPages - 1}.`);
    }
  } else if (!isDefined(pageNumber)) {
    return new Error(
      `\`${propName}\` not supplied. Either pageIndex or pageNumber must be supplied to \`${componentName}\`.`,
    );
  }

  // Everything is fine
  return null;
};

export const isPageNumber: Validator<number> = function isPageNumber(
  props,
  propName,
  componentName,
) {
  const { [propName]: pageNumber, pageIndex, pdf } = props;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error(
        `\`${propName}\` of type \`${typeof pageNumber}\` supplied to \`${componentName}\`, expected \`number\`.`,
      );
    }

    if (pageNumber < 1) {
      return new Error(`Expected \`${propName}\` to be greater or equal to 1.`);
    }

    const { numPages } = pdf;

    if (pageNumber > numPages) {
      return new Error(`Expected \`${propName}\` to be less or equal to ${numPages}.`);
    }
  } else if (!isDefined(pageIndex)) {
    return new Error(
      `\`${propName}\` not supplied. Either pageIndex or pageNumber must be supplied to \`${componentName}\`.`,
    );
  }

  // Everything is fine
  return null;
};

export const isPdf = PropTypes.oneOfType([
  PropTypes.shape({
    getDestination: PropTypes.func.isRequired,
    getOutline: PropTypes.func.isRequired,
    getPage: PropTypes.func.isRequired,
    numPages: PropTypes.number.isRequired,
  }),
  PropTypes.bool,
]);

export const isRef = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.exact({
    current: PropTypes.any,
  }),
]);

export const isRenderMode = PropTypes.oneOf(['canvas', 'none', 'svg']);

export const isRotate = PropTypes.oneOf([0, 90, 180, 270]);
