import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import {
  callIfDefined,
  errorOnDev,
  isDefined,
  makeCancellable,
} from './shared/util';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName, isPdf } from './shared/propTypes';

class Ref {
  constructor({ num, gen }) {
    this.num = num;
    this.gen = gen;
  }

  toString() {
    let str = `${this.num}R`;
    if (this.gen !== 0) {
      str += this.gen;
    }
    return str;
  }
}

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
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  get eventProps() {
    return makeEventProps(this.props, this.state.outline);
  }

  /**
   * Called when an outline is read successfully
   */
  onLoadSuccess = (outline) => {
    callIfDefined(this.props.onLoadSuccess);

    this.runningTask = makeCancellable(this.parseOutline(outline));

    return this.runningTask.promise
      .then(this.onParseSuccess)
      .catch(this.onParseError);
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

  onParseSuccess = (outline) => {
    callIfDefined(
      this.props.onParseSuccess,
      {
        outline,
      },
    );

    this.setState({ outline });
  }

  /**
   * Called when an outline failed to read successfully
   */
  onParseError = (error) => {
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error.message, error);

    callIfDefined(
      this.props.onParseError,
      error,
    );

    this.setState({ outline: false });
  }

  async mapOutlineItem(item) {
    const { pdf } = this.props;

    const mappedItem = {
      title: item.title,
      destination: item.dest,
      async getDestination() {
        if (typeof this.destination === 'string') {
          return pdf.getDestination(this.destination);
        }
        return this.destination;
      },
      async getPageIndex() {
        if (!isDefined(this.pageIndex)) {
          const destination = await this.getDestination();
          if (destination) {
            const [ref] = destination;
            this.pageIndex = pdf.getPageIndex(new Ref(ref));
          }
        }
        return this.pageIndex;
      },
      async getPageNumber() {
        if (!isDefined(this.pageNumber)) {
          this.pageNumber = await this.getPageIndex() + 1;
        }
        return this.pageNumber;
      },
    };

    if (item.items && item.items.length) {
      mappedItem.items = await Promise.all(item.items.map(subitem => this.mapOutlineItem(subitem)));
    }

    return mappedItem;
  }

  async parseOutline(outline) {
    if (!outline) {
      return null;
    }

    return Promise.all(outline.map(item => this.mapOutlineItem(item)));
  }

  async onItemClick(item) {
    const pageIndex = await item.getPageIndex();
    const pageNumber = await item.getPageNumber();

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

  renderOutline(outline = this.state.outline) {
    return (
      <ul>
        {
          outline.map((item, itemIndex) => (
            <li
              key={
                typeof item.destination === 'string' ?
                  item.destination :
                  itemIndex
              }
            >
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();

                  this.onItemClick(item);
                }}
              >
                {item.title}
              </a>
              {item.items && this.renderOutline(item.items)}
            </li>
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
        className={mergeClassNames('ReactPDF__Outline', className)}
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
  onParseError: PropTypes.func,
  onParseSuccess: PropTypes.func,
  pdf: isPdf,
  ...eventsProps(),
};
