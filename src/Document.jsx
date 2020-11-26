/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import makeCancellable from 'make-cancellable-promise';
import mergeClassNames from 'merge-class-names';
import * as pdfjs from 'pdfjs-dist';

import DocumentContext from './DocumentContext';

import Message from './Message';

import LinkService from './LinkService';
import PasswordResponses from './PasswordResponses';
import eventBus from './eventBus';

import {
  cancelRunningTask,
  dataURItoUint8Array,
  displayCORSWarning,
  errorOnDev,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  loadFromFile,
  warnOnDev,
} from './shared/utils';

import { eventProps, isClassName, isRef } from './shared/propTypes';

const { PDFDataRangeTransport } = pdfjs;

export default class Document extends PureComponent {
  state = {
    pdf: null,
  }

  viewer = {
    scrollPageIntoView: ({ pageNumber }) => {
      // Handling jumping to internal links target
      const { onItemClick } = this.props;

      // First, check if custom handling of onItemClick was provided
      if (onItemClick) {
        onItemClick({ pageNumber });
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

  linkService = new LinkService({ eventBus });

  componentDidMount() {
    this.loadDocument();
    this.setupLinkService();
  }

  componentDidUpdate(prevProps) {
    const { file } = this.props;
    if (file !== prevProps.file) {
      this.loadDocument();
    }
  }

  componentWillUnmount() {
    if (this.loadingTask) this.loadingTask.destroy();
    cancelRunningTask(this.runningTask);
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

    const { options, onLoadProgress, onPassword } = this.props;

    try {
      // If another loading is in progress, let's cancel it
      cancelRunningTask(this.runningTask);

      this.loadingTask = pdfjs.getDocument({ ...source, ...options });
      this.loadingTask.onPassword = onPassword;
      if (onLoadProgress) {
        this.loadingTask.onProgress = onLoadProgress;
      }
      const cancellable = makeCancellable(this.loadingTask.promise);
      this.runningTask = cancellable;
      const pdf = await cancellable.promise;

      this.setState((prevState) => {
        if (prevState.pdf && prevState.pdf.fingerprint === pdf.fingerprint) {
          return null;
        }

        return { pdf };
      }, this.onLoadSuccess);
    } catch (error) {
      this.onLoadError(error);
    }
  }

  setupLinkService = () => {
    this.linkService.setViewer(this.viewer);
    const documentInstance = this;
    Object.defineProperty(this.linkService, 'externalLinkTarget', {
      get() {
        const { externalLinkTarget } = documentInstance.props;
        switch (externalLinkTarget) {
          case '_self': return 1;
          case '_blank': return 2;
          case '_parent': return 3;
          case '_top': return 4;
          default: return 0;
        }
      },
    });
  }

  get childContext() {
    const { linkService, registerPage, unregisterPage } = this;
    const { renderMode, rotate } = this.props;
    const { pdf } = this.state;

    return {
      linkService,
      pdf,
      registerPage,
      renderMode,
      rotate,
      unregisterPage,
    };
  }

  get eventProps() {
    // eslint-disable-next-line react/destructuring-assignment
    return makeEventProps(this.props, () => this.state.pdf);
  }

  /**
   * Called when a document source is resolved correctly
   */
  onSourceSuccess = () => {
    const { onSourceSuccess } = this.props;

    if (onSourceSuccess) onSourceSuccess();
  }

  /**
   * Called when a document source failed to be resolved correctly
   */
  onSourceError = (error) => {
    errorOnDev(error);

    const { onSourceError } = this.props;

    if (onSourceError) onSourceError(error);
  }

  /**
   * Called when a document is read successfully
   */
  onLoadSuccess = () => {
    const { onLoadSuccess } = this.props;
    const { pdf } = this.state;

    if (onLoadSuccess) onLoadSuccess(pdf);

    this.pages = new Array(pdf.numPages);
    this.linkService.setDocument(pdf);
  }

  /**
   * Called when a document failed to read successfully
   */
  onLoadError = (error) => {
    this.setState({ pdf: false });

    errorOnDev(error);

    const { onLoadError } = this.props;

    if (onLoadError) onLoadError(error);
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

  renderChildren() {
    const { children } = this.props;

    return (
      <DocumentContext.Provider value={this.childContext}>
        {children}
      </DocumentContext.Provider>
    );
  }

  renderContent() {
    const { file } = this.props;
    const { pdf } = this.state;

    if (!file) {
      const { noData } = this.props;

      return (
        <Message type="no-data">
          {typeof noData === 'function' ? noData() : noData}
        </Message>
      );
    }

    if (pdf === null) {
      const { loading } = this.props;

      return (
        <Message type="loading">
          {typeof loading === 'function' ? loading() : loading}
        </Message>
      );
    }

    if (pdf === false) {
      const { error } = this.props;

      return (
        <Message type="error">
          {typeof error === 'function' ? error() : error}
        </Message>
      );
    }

    return this.renderChildren();
  }

  render() {
    const { className, inputRef } = this.props;

    return (
      <div
        className={mergeClassNames('react-pdf__Document', className)}
        ref={inputRef}
        {...this.eventProps}
      >
        {this.renderContent()}
      </div>
    );
  }
}

Document.defaultProps = {
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.',
  onPassword: (callback, reason) => {
    switch (reason) {
      case PasswordResponses.NEED_PASSWORD: {
        // eslint-disable-next-line no-alert
        const password = prompt('Enter the password to open this PDF file.');
        callback(password);
        break;
      }
      case PasswordResponses.INCORRECT_PASSWORD: {
        // eslint-disable-next-line no-alert
        const password = prompt('Invalid password. Please try again.');
        callback(password);
        break;
      }
      default:
    }
  },
};

const isFunctionOrNode = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.node,
]);

Document.propTypes = {
  ...eventProps,
  children: PropTypes.node,
  className: isClassName,
  error: isFunctionOrNode,
  file: isFile,
  inputRef: isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadProgress: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onPassword: PropTypes.func,
  onSourceError: PropTypes.func,
  onSourceSuccess: PropTypes.func,
  rotate: PropTypes.number,
};
