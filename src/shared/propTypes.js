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

export const pdfProp = PropTypes.shape({
  getDestination: PropTypes.func.isRequired,
  getOutline: PropTypes.func.isRequired,
  getPage: PropTypes.func.isRequired,
  numPages: PropTypes.number.isRequired,
});

export const pageProp = PropTypes.shape({
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

export const rotateProp = PropTypes.oneOf([0, 90, 180, 270]);

export const linkServiceProp = PropTypes.instanceOf(LinkService);
