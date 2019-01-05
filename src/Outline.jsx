import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import OutlineItem from './OutlineItem';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  isCancelException,
  makeCancellable,
} from './shared/utils';

import { eventsProps, isClassName, isPdf } from './shared/propTypes';

export class OutlineInternal extends PureComponent {
  state = {
    outline: null,
  }

  componentDidMount() {
    const { pdf } = this.props;

    if (!pdf) {
      throw new Error('Attempted to load an outline, but no document was specified.');
    }

    this.loadOutline();
  }

  componentDidUpdate(prevProps) {
    const { pdf } = this.props;

    if (prevProps.pdf && (pdf !== prevProps.pdf)) {
      this.loadOutline();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadOutline = async () => {
    const { pdf } = this.props;

    this.setState((prevState) => {
      if (!prevState.outline) {
        return null;
      }
      return { outline: null };
    });

    try {
      const cancellable = makeCancellable(pdf.getOutline());
      this.runningTask = cancellable;
      const outline = await cancellable.promise;
      this.setState({ outline }, this.onLoadSuccess);
    } catch (error) {
      this.onLoadError(error);
    }
  }

  get childContext() {
    return {
      onClick: this.onItemClick,
    };
  }

  get eventProps() {
    // eslint-disable-next-line react/destructuring-assignment
    return makeEventProps(this.props, () => this.state.outline);
  }

  /**
   * Called when an outline is read successfully
   */
  onLoadSuccess = () => {
    const { onLoadSuccess } = this.props;
    const { outline } = this.state;

    callIfDefined(
      onLoadSuccess,
      outline,
    );
  }

  /**
   * Called when an outline failed to read successfully
   */
  onLoadError = (error) => {
    if (isCancelException(error)) {
      return;
    }

    this.setState({ outline: false });

    errorOnDev(error);

    const { onLoadError } = this.props;

    callIfDefined(
      onLoadError,
      error,
    );
  }

  onItemClick = ({ pageIndex, pageNumber }) => {
    const { onItemClick } = this.props;

    callIfDefined(
      onItemClick,
      {
        pageIndex,
        pageNumber,
      },
    );
  }

  renderOutline() {
    const { outline } = this.state;

    return (
      <ul>
        {
          outline.map((item, itemIndex) => (
            <OutlineItem
              key={
                typeof item.destination === 'string'
                  ? item.destination
                  : itemIndex
              }
              item={item}
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

    const { className, inputRef } = this.props;

    return (
      <div
        className={mergeClassNames('react-pdf__Outline', className)}
        ref={inputRef}
        {...this.eventProps}
      >
        <OutlineContext.Provider value={this.childContext}>
          {this.renderOutline()}
        </OutlineContext.Provider>
      </div>
    );
  }
}

OutlineInternal.propTypes = {
  className: isClassName,
  inputRef: PropTypes.func,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventsProps(),
};

const Outline = props => (
  <DocumentContext.Consumer>
    {context => <OutlineInternal {...context} {...props} />}
  </DocumentContext.Consumer>
);

export default Outline;
