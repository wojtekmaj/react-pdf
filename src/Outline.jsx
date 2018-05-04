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

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.getPdf(nextProps, nextContext) !== this.getPdf()) {
      this.loadOutline(nextProps, nextContext);
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  getPdf(props = this.props, context = this.context) {
    return props.pdf || context.pdf;
  }

  getChildContext() {
    return {
      pdf: this.getPdf(),
      onClick: this.onItemClick,
    };
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

  loadOutline(props = this.props, context = this.context) {
    const pdf = this.getPdf(props, context);

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
            />
          ))
        }
      </ul>
    );
  }

  render() {
    const pdf = this.getPdf();
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

Outline.childContextTypes = {
  onClick: PropTypes.func,
  pdf: isPdf,
};

Outline.contextTypes = {
  pdf: isPdf,
};

Outline.propTypes = {
  className: isClassName,
  inputRef: PropTypes.func,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  ...eventsProps(),
};
