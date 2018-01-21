import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import OutlineItem from './OutlineItem';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  makeCancellable,
} from './shared/utils';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName, isPdf } from './shared/propTypes';

export default class Outline extends Component {
  state = {
    outline: null,
  }

  componentDidMount() {
    this.loadOutline();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pdf !== this.props.pdf) {
      this.loadOutline(nextProps);
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  get eventProps() {
    return makeEventProps(this.props, () => this.state.outline);
  }

  /**
   * Called when an outline is read successfully
   */
  onLoadSuccess = (outline) => {
    this.setState({ outline }, () => {
      callIfDefined(
        this.props.onLoadSuccess,
        outline,
      );
    });
  }

  /**
   * Called when an outline failed to read successfully
   */
  onLoadError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error.message, error);

    callIfDefined(
      this.props.onLoadError,
      error,
    );

    this.setState({ outline: false });
  }

  onItemClick = ({ pageIndex, pageNumber }) => {
    callIfDefined(
      this.props.onItemClick,
      {
        pageIndex,
        pageNumber,
      },
    );
  }

  loadOutline(props = this.props) {
    const { pdf } = props;

    if (!pdf) {
      throw new Error('Attempted to load an outline, but no document was specified.');
    }

    if (this.state.outline !== null) {
      this.setState({ outline: null });
    }

    this.runningTask = makeCancellable(pdf.getOutline());

    return this.runningTask.promise
      .then(this.onLoadSuccess)
      .catch(this.onLoadError);
  }

  renderOutline() {
    const { pdf } = this.props;
    const { outline } = this.state;

    return (
      <ul>
        {
          outline.map((item, itemIndex) => (
            <OutlineItem
              key={
                typeof item.destination === 'string' ?
                  item.destination :
                  itemIndex
              }
              item={item}
              onClick={this.onItemClick}
              pdf={pdf}
            />
          ))
        }
      </ul>
    );
  }

  render() {
    const { pdf } = this.props;
    const { outline } = this.state;

    if (!pdf || !outline) {
      return null;
    }

    const { className } = this.props;

    return (
      <div
        className={mergeClassNames('react-pdf__Outline', className)}
        ref={this.props.inputRef}
        {...this.eventProps}
      >
        {this.renderOutline()}
      </div>
    );
  }
}

Outline.propTypes = {
  className: isClassName,
  inputRef: PropTypes.func,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventsProps(),
};
