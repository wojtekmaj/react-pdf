/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import {
  callIfDefined,
  displayCORSWarning,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  isParamObject,
  isString,
  makeCancellable,
} from './shared/util';
import { makeEventProps } from './shared/events';
import { readFile } from './shared/fileReader';

import { eventsProps } from './shared/propTypes';

export default class Document extends Component {
  state = {
    pdf: null,
  }

  componentDidMount() {
    this.loadDocument();
  }

  async componentWillReceiveProps(nextProps) {
    if (await this.shouldLoadDocument(nextProps)) {
      if (this.runningTask && this.runningTask.cancel) {
        this.runningTask.cancel();
      }

      this.loadDocument(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }
  }

  get eventProps() {
    return makeEventProps(this.props, this.state.pdf);
  }

  /**
   * Called when a document source is resolved correctly
   */
  onSourceSuccess = (source) => {
    callIfDefined(this.props.onSourceSuccess);

    if (!PDFJS) {
      throw new Error('Could not load the document. PDF.js is not loaded.');
    }

    if (this.state.pdf !== null) {
      this.setState({ pdf: null });
    }

    if (!source) {
      return null;
    }

    this.runningTask = makeCancellable(PDFJS.getDocument(source));

    return this.runningTask.promise
      .then(this.onLoadSuccess)
      .catch(this.onLoadError);
  }

  /**
   * Called when a document source failed to be resolved correctly
   */
  onSourceError = (error) => {
    if (error === 'cancelled') {
      return;
    }

    callIfDefined(
      this.props.onSourceError,
      error,
    );

    this.setState({ pdf: false });
  }

  /**
   * Called when a document is read successfully
   */
  onLoadSuccess = (pdf) => {
    callIfDefined(
      this.props.onLoadSuccess,
      pdf,
    );

    this.setState({ pdf });
  }

  /**
   * Called when a document failed to read successfully
   */
  onLoadError = (error) => {
    if (error === 'cancelled') {
      return;
    }

    callIfDefined(
      this.props.onLoadError,
      error,
    );

    this.setState({ pdf: false });
  }

  async shouldLoadDocument(nextProps) {
    const nextFile = nextProps.file;
    const { file } = this.props;

    // We got an object and previously it was an object too - we need to compare deeply
    if (
      isParamObject(nextFile) &&
      isParamObject(file)
    ) {
      return (
        nextFile.data !== file.data ||
        nextFile.range !== file.range ||
        nextFile.url !== file.url
      );
    }

    // We either have or had an object - most likely there was a change
    if (isParamObject(nextFile) !== isParamObject(file)) {
      return true;
    }

    // We got file of different type - clearly there was a change
    if (typeof nextFile !== typeof file) {
      return true;
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (isBrowser) {
      // File is a Blob or a File
      if (
        (isBlob(nextFile) || isFile(nextFile)) &&
        (isBlob(file) || isFile(file))
      ) {
        /**
         * Theoretically, we could compare files here by reading them, but that would
         * severely affect performance. Therefore, we're making a compromise here, agreeing
         * on not loading the next file if its size is identical as the previous one's.
         */
        return nextFile.size !== file.size;
      }
    }

    return nextFile !== file;
  }

  loadDocument(props = this.props) {
    this.runningTask = makeCancellable(this.findDocumentSource(props.file));

    return this.runningTask.promise
      .then(this.onSourceSuccess)
      .catch(this.onSourceError);
  }

  /**
   * Attempts to find a document source based on props.
   */
  async findDocumentSource(file = this.props.file) {
    if (!file) {
      return null;
    }

    // File is a string
    if (isString(file)) {
      if (!isDataURI(file)) {
        displayCORSWarning();
      }

      return file;
    }

    if (isArrayBuffer(file)) {
      return file;
    }

    if (isParamObject(file)) {
      // Prevent from modifying props
      const modifiedFile = Object.assign({}, file);

      if ('url' in modifiedFile) {
        // File is data URI
        if (!isDataURI(modifiedFile.url)) {
          displayCORSWarning();
        }
      }

      return modifiedFile;
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (isBrowser) {
      // File is a Blob
      if (isBlob(file) || isFile(file)) {
        const loadedFile = await readFile(file);

        return new Uint8Array(loadedFile);
      }
    }

    // No supported loading method worked
    throw new Error({ message: 'Unsupported loading method.' });
  }

  renderNoData() {
    return (
      <div className="ReactPDF__NoData">{this.props.noData}</div>
    );
  }

  renderError() {
    return (
      <div className="ReactPDF__Error">{this.props.error}</div>
    );
  }

  renderLoader() {
    return (
      <div className="ReactPDF__Loader">{this.props.loading}</div>
    );
  }

  renderChildren() {
    const { children, className, rotate } = this.props;
    const { pdf } = this.state;

    const childProps = {
      pdf,
      rotate,
    };

    return (
      <div
        className={mergeClassNames('ReactPDF__Document', className)}
        {...this.eventProps}
      >
        {
          children && Children
            .map(children, child => React.cloneElement(child, childProps))
        }
      </div>
    );
  }

  render() {
    const { file } = this.props;

    if (!file) {
      return this.renderNoData();
    }

    const { pdf } = this.state;

    if (pdf === null) {
      return this.renderLoader();
    }

    if (pdf === false) {
      return this.renderError();
    }

    return this.renderChildren();
  }
}

Document.defaultProps = {
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.',
};

Document.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  error: PropTypes.node,
  file: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(File),
    PropTypes.instanceOf(Blob),
    PropTypes.instanceOf(ArrayBuffer),
    PropTypes.shape({
      data: PropTypes.object,
      httpHeaders: PropTypes.object,
      range: PropTypes.object,
      url: PropTypes.string,
      withCredentials: PropTypes.bool,
    }),
  ]),
  loading: PropTypes.node,
  noData: PropTypes.node,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onSourceError: PropTypes.func,
  onSourceSuccess: PropTypes.func,
  rotate: PropTypes.number,
  ...eventsProps(),
};
