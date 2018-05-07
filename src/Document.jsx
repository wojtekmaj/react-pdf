/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import pdfjs, { PDFDataRangeTransport } from 'pdfjs-dist';

import DocumentContext from './DocumentContext';

import LinkService from './LinkService';

import {
  callIfDefined,
  cancelRunningTask,
  dataURItoUint8Array,
  displayCORSWarning,
  errorOnDev,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  makeCancellable,
  warnOnDev,
} from './shared/utils';

import { eventsProps, isClassName } from './shared/propTypes';

const loadFromFile = file => new Promise((resolve, reject) => {
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
});

export default class Document extends PureComponent {
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

  componentDidUpdate(prevProps) {
    if (this.props.file !== prevProps.file) {
      this.loadDocument();
    }
  }

  loadDocument = async () => {
    let source = null;
    try {
      source = await this.findDocumentSource();
      this.onSourceSuccess();
    } catch (error) {
      this.onSourceError(error);
    }

    if (!source) {
      return;
    }

    this.setState((prevState) => {
      if (!prevState.pdf) {
        return null;
      }
      return { pdf: null };
    });

    const { options } = this.props;

    try {
      const cancellable = makeCancellable(pdfjs.getDocument({ ...source, ...options }));
      this.runningTask = cancellable;
      const pdf = await cancellable.promise;
      this.setState((prevState) => {
        if (prevState.pdf && prevState.pdf.fingerprint === pdf.fingerprint) {
          return null;
        }

        return { pdf };
      }, this.onLoadSuccess);
    } catch (error) {
      this.setState({ pdf: false });
      this.onLoadError(error);
    }
  }

  componentWillUnmount() {
    cancelRunningTask(this.runningTask);
  }

  get childContext() {
    const { linkService, registerPage, unregisterPage } = this;
    const { rotate } = this.props;

    return {
      linkService,
      pdf: this.state.pdf,
      registerPage,
      rotate,
      unregisterPage,
    };
  }

  get eventProps() {
    return makeEventProps(this.props, () => this.state.pdf);
  }

  /**
   * Called when a document source is resolved correctly
   */
  onSourceSuccess = () => {
    callIfDefined(this.props.onSourceSuccess);
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

    errorOnDev(error);

    callIfDefined(
      this.props.onSourceError,
      error,
    );
  }

  /**
   * Called when a document is read successfully
   */
  onLoadSuccess = () => {
    callIfDefined(
      this.props.onLoadSuccess,
      this.state.pdf,
    );

    this.pages = new Array(this.state.pdf.numPages);
    this.linkService.setDocument(this.state.pdf);
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

    errorOnDev(error);

    callIfDefined(
      this.props.onLoadError,
      error,
    );
  }

  /**
   * Finds a document source based on props.
   */
  findDocumentSource = async () => {
    const { file } = this.props;

    if (!file) {
      return null;
    }

    // File is a string
    if (typeof file === 'string') {
      if (isDataURI(file)) {
        const fileUint8Array = dataURItoUint8Array(file);
        return { data: fileUint8Array };
      }

      displayCORSWarning();
      return { url: file };
    }

    // File is PDFDataRangeTransport
    if (file instanceof PDFDataRangeTransport) {
      return { range: file };
    }

    // File is an ArrayBuffer
    if (isArrayBuffer(file)) {
      return { data: file };
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (isBrowser) {
      // File is a Blob
      if (isBlob(file) || isFile(file)) {
        return { data: await loadFromFile(file) };
      }
    }

    // At this point, file must be an object
    if (typeof file !== 'object') {
      throw new Error('Invalid parameter in file, need either Uint8Array, string or a parameter object');
    }

    if (!file.url && !file.data && !file.range) {
      throw new Error('Invalid parameter object: need either .data, .range or .url');
    }

    // File .url is a string
    if (typeof file.url === 'string') {
      if (isDataURI(file.url)) {
        const { url, ...otherParams } = file;
        const fileUint8Array = dataURItoUint8Array(url);
        return { data: fileUint8Array, ...otherParams };
      }

      displayCORSWarning();
    }

    return file;
  };

  registerPage = (pageIndex, ref) => {
    this.pages[pageIndex] = ref;
  }

  unregisterPage = (pageIndex) => {
    delete this.pages[pageIndex];
  }

  renderNoData() {
    return (
      <div className="react-pdf__message react-pdf__message--no-data">{this.props.noData}</div>
    );
  }

  renderError() {
    return (
      <div className="react-pdf__message react-pdf__message--error">{this.props.error}</div>
    );
  }

  renderLoader() {
    return (
      <div className="react-pdf__message react-pdf__message--loading">{this.props.loading}</div>
    );
  }

  renderChildren() {
    return (
      <DocumentContext.Provider value={this.childContext}>
        {this.props.children}
      </DocumentContext.Provider>
    );
  }

  render() {
    const { className, file, inputRef } = this.props;
    const { pdf } = this.state;

    let content;
    if (!file) {
      content = this.renderNoData();
    } else if (pdf === null) {
      content = this.renderLoader();
    } else if (pdf === false) {
      content = this.renderError();
    } else {
      content = this.renderChildren();
    }

    return (
      <div
        className={mergeClassNames('react-pdf__Document', className)}
        ref={inputRef}
        {...this.eventProps}
      >
        {content}
      </div>
    );
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
