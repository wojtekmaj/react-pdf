/**
 * Loads a PDF document. Passes it to all children.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import makeCancellable from 'make-cancellable-promise';
import mergeClassNames from 'merge-class-names';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import DocumentContext from './DocumentContext';

import Message from './Message';

import LinkService from './LinkService';
import PasswordResponses from './PasswordResponses';

import {
  cancelRunningTask,
  dataURItoByteString,
  displayCORSWarning,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  loadFromFile,
} from './shared/utils';

import { eventProps, isClassName, isFile as isFileProp, isRef } from './shared/propTypes';

const { PDFDataRangeTransport } = pdfjs;

export default class Document extends PureComponent {
  state = {
    pdf: null,
  };

  viewer = {
    scrollPageIntoView: ({ dest, pageIndex, pageNumber }) => {
      // Handling jumping to internal links target
      const { onItemClick } = this.props;

      // First, check if custom handling of onItemClick was provided
      if (onItemClick) {
        onItemClick({ dest, pageIndex, pageNumber });
        return;
      }

      // If not, try to look for target page within the <Document>.
      const page = this.pages[pageIndex];

      if (page) {
        // Scroll to the page automatically
        page.scrollIntoView();
        return;
      }

      warning(
        false,
        `An internal link leading to page ${pageNumber} was clicked, but neither <Document> was provided with onItemClick nor it was able to find the page within itself. Either provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>.`,
      );
    },
  };

  linkService = new LinkService();

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
    // If rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask);

    // If loading is in progress, let's destroy it
    if (this.loadingTask) this.loadingTask.destroy();
  }

  loadDocument = () => {
    // If another rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask);

    // If another loading is in progress, let's destroy it
    if (this.loadingTask) this.loadingTask.destroy();

    const cancellable = makeCancellable(this.findDocumentSource());
    this.runningTask = cancellable;

    cancellable.promise
      .then((source) => {
        this.onSourceSuccess();

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

        this.loadingTask = pdfjs.getDocument({ ...source, ...options });
        this.loadingTask.onPassword = onPassword;
        if (onLoadProgress) {
          this.loadingTask.onProgress = onLoadProgress;
        }
        const cancellable = makeCancellable(this.loadingTask.promise);
        this.runningTask = cancellable;

        cancellable.promise
          .then((pdf) => {
            this.setState((prevState) => {
              if (prevState.pdf && prevState.pdf.fingerprint === pdf.fingerprint) {
                return null;
              }

              return { pdf };
            }, this.onLoadSuccess);
          })
          .catch((error) => {
            this.onLoadError(error);
          });
      })
      .catch((error) => {
        this.onSourceError(error);
      });
  };

  setupLinkService = () => {
    const { externalLinkRel, externalLinkTarget } = this.props;

    this.linkService.setViewer(this.viewer);
    this.linkService.setExternalLinkRel(externalLinkRel);
    this.linkService.setExternalLinkTarget(externalLinkTarget);
  };

  get childContext() {
    const { linkService, registerPage, unregisterPage } = this;
    const { imageResourcesPath, renderMode, rotate } = this.props;
    const { pdf } = this.state;

    return {
      imageResourcesPath,
      linkService,
      pdf,
      registerPage,
      renderMode,
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
    const { onSourceSuccess } = this.props;

    if (onSourceSuccess) onSourceSuccess();
  };

  /**
   * Called when a document source failed to be resolved correctly
   */
  onSourceError = (error) => {
    warning(error);

    const { onSourceError } = this.props;

    if (onSourceError) onSourceError(error);
  };

  /**
   * Called when a document is read successfully
   */
  onLoadSuccess = () => {
    const { onLoadSuccess } = this.props;
    const { pdf } = this.state;

    if (onLoadSuccess) onLoadSuccess(pdf);

    this.pages = new Array(pdf.numPages);
    this.linkService.setDocument(pdf);
  };

  /**
   * Called when a document failed to read successfully
   */
  onLoadError = (error) => {
    this.setState({ pdf: false });

    warning(error);

    const { onLoadError } = this.props;

    if (onLoadError) onLoadError(error);
  };

  /**
   * Finds a document source based on props.
   */
  findDocumentSource = () =>
    new Promise((resolve) => {
      const { file } = this.props;

      if (!file) {
        resolve(null);
      }

      // File is a string
      if (typeof file === 'string') {
        if (isDataURI(file)) {
          const fileByteString = dataURItoByteString(file);
          resolve({ data: fileByteString });
        }

        displayCORSWarning();
        resolve({ url: file });
      }

      // File is PDFDataRangeTransport
      if (file instanceof PDFDataRangeTransport) {
        resolve({ range: file });
      }

      // File is an ArrayBuffer
      if (isArrayBuffer(file)) {
        resolve({ data: file });
      }

      /**
       * The cases below are browser-only.
       * If you're running on a non-browser environment, these cases will be of no use.
       */
      if (isBrowser) {
        // File is a Blob
        if (isBlob(file) || isFile(file)) {
          loadFromFile(file).then((data) => {
            resolve({ data });
          });
          return;
        }
      }

      // At this point, file must be an object
      invariant(
        typeof file === 'object',
        'Invalid parameter in file, need either Uint8Array, string or a parameter object',
      );

      invariant(
        file.url || file.data || file.range,
        'Invalid parameter object: need either .data, .range or .url',
      );

      // File .url is a string
      if (typeof file.url === 'string') {
        if (isDataURI(file.url)) {
          const { url, ...otherParams } = file;
          const fileByteString = dataURItoByteString(url);
          resolve({ data: fileByteString, ...otherParams });
        }

        displayCORSWarning();
      }

      resolve(file);
    });

  registerPage = (pageIndex, ref) => {
    this.pages[pageIndex] = ref;
  };

  unregisterPage = (pageIndex) => {
    delete this.pages[pageIndex];
  };

  renderChildren() {
    const { children } = this.props;

    return (
      <DocumentContext.Provider value={this.childContext}>{children}</DocumentContext.Provider>
    );
  }

  renderContent() {
    const { file } = this.props;
    const { pdf } = this.state;

    if (!file) {
      const { noData } = this.props;

      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null) {
      const { loading } = this.props;

      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false) {
      const { error } = this.props;

      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
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

const isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);

Document.propTypes = {
  ...eventProps,
  children: PropTypes.node,
  className: isClassName,
  error: isFunctionOrNode,
  externalLinkRel: PropTypes.string,
  externalLinkTarget: PropTypes.string,
  file: isFileProp,
  imageResourcesPath: PropTypes.string,
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
