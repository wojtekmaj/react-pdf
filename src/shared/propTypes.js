import PropTypes from 'prop-types';
import once from 'lodash.once';
import { mouseEvents, touchEvents } from './events';

/* eslint-disable import/prefer-default-export */

export const eventsProps = once(() => {
  const eventProps = {};

  [].concat(mouseEvents, touchEvents).forEach((eventName) => {
    eventProps[eventName] = PropTypes.func;
  });

  return eventProps;
});
