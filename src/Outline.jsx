import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import OutlineItem from './OutlineItem';

import { cancelRunningTask } from './shared/utils';

import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes';

export class OutlineInternal extends PureComponent {
  state = {
    outline: null,
  };

  componentDidMount() {
    const { pdf } = this.props;

    invariant(pdf, 'Attempted to load an outline, but no document was specified.');

    this.loadOutline();
  }

  componentDidUpdate(prevProps) {
    const { pdf } = this.props;

    if (prevProps.pdf && pdf !== prevProps.pdf) {
      this.loadOutline();
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  loadOutline = () => {
    const { pdf } = this.props;

    this.setState((prevState) => {
      if (!prevState.outline) {
        return null;
      }
      return { outline: null };
    });

    const cancellable = makeCancellable(pdf.getOutline());
    this.runningTask = cancellable;

    cancellable.promise
      .then((outline) => {
        this.setState({ outline }, this.onLoadSuccess);
      })
      .catch((error) => {
        this.onLoadError(error);
      });
  };

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
    const { onLoadSuccess } = this.props;
    const { outline } = this.state;

    if (onLoadSuccess) onLoadSuccess(outline);
  };

  /**
   * Called when an outline failed to read successfully
   */
  onLoadError = (error) => {
    this.setState({ outline: false });

    warning(error);

    const { onLoadError } = this.props;

    if (onLoadError) onLoadError(error);
  };

  onItemClick = ({ dest, pageIndex, pageNumber }) => {
    const { onItemClick } = this.props;

    if (onItemClick) {
      onItemClick({
        dest,
        pageIndex,
        pageNumber,
      });
    }
  };

  renderOutline() {
    const { outline } = this.state;

    return (
      <ul>
        {outline.map((item, itemIndex) => (
          <OutlineItem
            key={typeof item.destination === 'string' ? item.destination : itemIndex}
            item={item}
          />
        ))}
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
  inputRef: isRef,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventProps,
};

function Outline(props, ref) {
  return (
    <DocumentContext.Consumer>
      {(context) => <OutlineInternal ref={ref} {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}

export default React.forwardRef(Outline);
