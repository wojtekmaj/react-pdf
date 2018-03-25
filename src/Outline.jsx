import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import OutlineItem from './OutlineItem';

import {
  callIfDefined,
  cancelRunningTask,
  errorOnDev,
  makeCancellable,
} from './shared/utils';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName, isPdf } from './shared/propTypes';

export class OutlineInternal extends PureComponent {
  state = {
    outline: null,
  }

  componentDidMount() {
    if (!this.props.pdf) {
      throw new Error('Attempted to load an outline, but no document was specified.');
    }

    this.loadOutline();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pdf && (this.props.pdf !== prevProps.pdf)) {
      this.loadOutline();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadOutline = async () => {
    const { pdf } = this.props;

    let outline = null;
    try {
      const cancellable = makeCancellable(pdf.getOutline());
      this.runningTask = cancellable;
      outline = await cancellable.promise;
      this.setState({ outline }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ outline: false });
      this.onLoadError(error);
    }
  }

  get childContext() {
    return {
      onClick: this.onItemClick,
    };
  }

  get eventProps() {
    return makeEventProps(this.props, () => this.state.outline);
  }

  /**
   * Called when an outline is read successfully
   */
  onLoadSuccess = () => {
    callIfDefined(
      this.props.onLoadSuccess,
      this.state.outline,
    );
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

    errorOnDev(error);

    callIfDefined(
      this.props.onLoadError,
      error,
    );
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
