/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import LinkService from './LinkService';

import {
  callIfDefined,
  dataURItoUint8Array,
  displayCORSWarning,
  errorOnDev,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  isParamObject,
  isString,
  makeCancellable,
  warnOnDev,
} from './shared/util';
import { makeEventProps } from './shared/events';

import { eventsProps, isClassName } from './shared/propTypes';

export default class Document extends Component {
  state = {
    pdf: null,
  }

  viewer = {
    scrollPageIntoView: ({ pageNumber }) => {
      // Handling jumping to internal links target

      // First, check if custom handling of onItemClick was provided
      if (this.props.onItemClick) {
        this.props.onItemClick({ pageNumber });
        return;
      }

      // If not, try to look for target page within the <Document>.
      const page = this.pages[pageNumber - 1];

      if (page) {
        // Scroll to the page automatically
        page.scrollIntoView();
        return;
      }

      warnOnDev(`Warning: An internal link leading to page ${pageNumber} was clicked, but neither <Document> was provided with onItemClick nor it was able to find the page within itself. Either provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>.`);
    },
  };

  linkService = new LinkService();

  componentDidMount() {
    this.loadDocument();

    this.linkService.setViewer(this.viewer);
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldLoadDocument(nextProps)) {
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
    if (
      error.name === 'RenderingCancelledException' ||
      error.name === 'PromiseCancelledException'
    ) {
      return;
    }

    errorOnDev(error.message, error);

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

    this.pages = new Array(pdf.numPages);
    this.linkService.setDocument(pdf);
    this.setState({ pdf });
  }

  /**
   * Called when a document failed to read successfully
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

    this.setState({ pdf: false });
  }

  shouldLoadDocument(nextProps) {
    const { file: nextFile } = nextProps;
    const { file } = this.props;

    // We got file of different type - clearly there was a change
    if (typeof nextFile !== typeof file) {
      return true;
    }

    // We got an object and previously it was an object too - we need to compare deeply
    if (isParamObject(nextFile) && isParamObject(file)) {
      return (
        nextFile.data !== file.data ||
        nextFile.range !== file.range ||
        nextFile.url !== file.url
      );
    // We either have or had an object - most likely there was a change
    } else if (isParamObject(nextFile) || isParamObject(file)) {
      return true;
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (
      isBrowser &&
      // File is a Blob or a File
      (isBlob(nextFile) || isFile(nextFile)) &&
      (isBlob(file) || isFile(file))
    ) {
      /**
       * Theoretically, we could compare files here by reading them, but that would severely affect
       * performance. Therefore, we're making a compromise here, agreeing on not loading the next
       * file if its size is identical as the previous one's.
       */
      return nextFile.size !== file.size;
    }

    return nextFile !== file;
  }

  loadDocument(props = this.props) {
    if (this.runningTask && this.runningTask.cancel) {
      this.runningTask.cancel();
    }

    this.runningTask = makeCancellable(this.findDocumentSource(props.file));

    return this.runningTask.promise
      .then(this.onSourceSuccess)
      .catch(this.onSourceError);
  }

  /**
   * Attempts to find a document source based on props.
   */
  findDocumentSource = (file = this.props.file) => new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    // File is a string
    if (isString(file)) {
      if (isDataURI(file)) {
        const fileUint8Array = dataURItoUint8Array(file);
        return resolve(fileUint8Array);
      }

      displayCORSWarning();
      return resolve(file);
    }

    if (isArrayBuffer(file)) {
      return resolve(file);
    }

    if (isParamObject(file)) {
      // Prevent from modifying props
      const modifiedFile = Object.assign({}, file);

      if ('url' in modifiedFile) {
        // File is data URI
        if (isDataURI(modifiedFile.url)) {
          const fileUint8Array = dataURItoUint8Array(modifiedFile.url);
          return resolve(fileUint8Array);
        }

        displayCORSWarning();
      }

      return resolve(modifiedFile);
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (isBrowser) {
      // File is a Blob
      if (isBlob(file) || isFile(file)) {
        const reader = new FileReader();

        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = (event) => {
          switch (event.target.error.code) {
            case event.target.error.NOT_FOUND_ERR:
              return reject(new Error('Error while reading a file: File not found.'));
            case event.target.error.NOT_READABLE_ERR:
              return reject(new Error('Error while reading a file: File not readable.'));
            case event.target.error.SECURITY_ERR:
              return reject(new Error('Error while reading a file: Security error.'));
            case event.target.error.ABORT_ERR:
              return reject(new Error('Error while reading a file: Aborted.'));
            default:
              return reject(new Error('Error while reading a file.'));
          }
        };
        reader.readAsArrayBuffer(file);

        return null;
      }
    }

    // No supported loading method worked
    return reject(new Error('Unsupported loading method.'));
  })

  registerPage = (pageIndex, ref) => {
    this.pages[pageIndex] = ref;
  }

  unregisterPage = (pageIndex) => {
    delete this.pages[pageIndex];
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
    const {
      children, className, inputRef, rotate,
    } = this.props;
    const { pdf } = this.state;
    const { linkService, registerPage, unregisterPage } = this;

    const childProps = {
      linkService,
      registerPage,
      unregisterPage,
      pdf,
      rotate,
    };

    return (
      <div
        className={mergeClassNames('ReactPDF__Document', className)}
        ref={
          inputRef ?
            ((ref) => { inputRef(ref); }) :
            null
        }
        {...this.eventProps}
      >
        {
          children && Children
            .map(children, child =>
              React.cloneElement(child, Object.assign({}, childProps, child.props)),
            )
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
  className: isClassName,
  error: PropTypes.node,
  file: isFile,
  inputRef: PropTypes.func,
  loading: PropTypes.node,
  noData: PropTypes.node,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onSourceError: PropTypes.func,
  onSourceSuccess: PropTypes.func,
  rotate: PropTypes.number,
  ...eventsProps(),
};
