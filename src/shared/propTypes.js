import PropTypes from 'prop-types';
import once from 'lodash.once';
import { mouseEvents, touchEvents } from './events';

import LinkService from '../LinkService';

export const eventsProps = once(() => {
  const eventProps = {};

  [].concat(mouseEvents, touchEvents).forEach((eventName) => {
    eventProps[eventName] = PropTypes.func;
  });

  return eventProps;
});

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
if (typeof File !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(File));
}
if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

export const isClassName = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
]);

export const isFile = PropTypes.oneOfType(fileTypes);

export const isLinkService = PropTypes.instanceOf(LinkService);

export const isPage = PropTypes.shape({
  commonObjs: PropTypes.shape({
    objs: PropTypes.object.isRequired,
  }).isRequired,
  getAnnotations: PropTypes.func.isRequired,
  getTextContent: PropTypes.func.isRequired,
  getViewport: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
  transport: PropTypes.shape({
    fontLoader: PropTypes.object.isRequired,
  }).isRequired,
});

export const isPdf = PropTypes.shape({
  getDestination: PropTypes.func.isRequired,
  getOutline: PropTypes.func.isRequired,
  getPage: PropTypes.func.isRequired,
  numPages: PropTypes.number.isRequired,
});

export const isRotate = PropTypes.oneOf([0, 90, 180, 270]);
