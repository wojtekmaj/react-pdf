/**
 * Loads a PDF document. Passes it to all children.
 */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import makeCancellable from 'make-cancellable-promise';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

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

const Document = forwardRef(function Document(
  {
    children,
    className,
    error,
    externalLinkRel,
    externalLinkTarget,
    file,
    inputRef,
    imageResourcesPath,
    loading,
    noData,
    onItemClick,
    onLoadError: onLoadErrorProps,
    onLoadProgress,
    onLoadSuccess: onLoadSuccessProps,
    onPassword,
    onSourceError: onSourceErrorProps,
    onSourceSuccess: onSourceSuccessProps,
    options,
    renderMode,
    rotate,
    ...otherProps
  },
  ref,
) {
  const [source, setSource] = useState(null);
  const [pdf, setPdf] = useState(null);

  const linkService = useRef(new LinkService());

  const pages = useRef([]);

  const viewer = useRef({
    // Handling jumping to internal links target
    scrollPageIntoView: ({ dest, pageIndex, pageNumber }) => {
      // First, check if custom handling of onItemClick was provided
      if (onItemClick) {
        onItemClick({ dest, pageIndex, pageNumber });
        return;
      }

      // If not, try to look for target page within the <Document>.
      const page = pages.current[pageIndex];

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
  });

  useImperativeHandle(
    ref,
    () => {
      return {
        linkService,
        pages,
        viewer,
      };
    },
    [],
  );

  /**
   * Called when a document source is resolved correctly
   */
  const onSourceSuccess = useCallback(() => {
    if (onSourceSuccessProps) {
      onSourceSuccessProps();
    }
  }, [onSourceSuccessProps]);

  /**
   * Called when a document source failed to be resolved correctly
   */
  const onSourceError = useCallback(
    (error) => {
      warning(false, error);

      if (onSourceErrorProps) {
        onSourceErrorProps(error);
      }
    },
    [onSourceErrorProps],
  );

  function resetSource() {
    setSource(null);
  }

  useEffect(resetSource, [file]);

  const findDocumentSource = useCallback(async () => {
    if (!file) {
      return null;
    }

    // File is a string
    if (typeof file === 'string') {
      if (isDataURI(file)) {
        const fileByteString = dataURItoByteString(file);
        return { data: fileByteString };
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
        const data = await loadFromFile(file);

        return { data };
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
        return { data: fileByteString, ...otherParams };
      }

      displayCORSWarning();
    }

    return file;
  }, [file]);

  useEffect(() => {
    const cancellable = makeCancellable(findDocumentSource());

    cancellable.promise
      .then((nextSource) => {
        setSource(nextSource);
        onSourceSuccess();
      })
      .catch(onSourceError);

    return () => {
      cancelRunningTask(cancellable);
    };
  }, [findDocumentSource, onSourceError, onSourceSuccess]);

  /**
   * Called when a document is read successfully
   */
  const onLoadSuccess = useCallback(
    (nextPdf) => {
      if (onLoadSuccessProps) {
        onLoadSuccessProps(nextPdf);
      }

      pages.current = new Array(nextPdf.numPages);
      linkService.current.setDocument(nextPdf);
    },
    [onLoadSuccessProps],
  );

  /**
   * Called when a document failed to read successfully
   */
  const onLoadError = useCallback(
    (error) => {
      setPdf(false);

      warning(false, error);

      if (onLoadErrorProps) {
        onLoadErrorProps(error);
      }
    },
    [onLoadErrorProps],
  );

  function resetDocument() {
    setPdf(null);
  }

  useEffect(resetDocument, [source]);

  function loadDocument() {
    if (!source) {
      return;
    }

    const destroyable = pdfjs.getDocument({ ...source, ...options });
    destroyable.onPassword = onPassword;
    if (onLoadProgress) {
      destroyable.onProgress = onLoadProgress;
    }
    const loadingTask = destroyable;

    loadingTask.promise
      .then((nextPdf) => {
        setPdf(nextPdf);

        // Waiting for pdf to be set in state
        setTimeout(() => {
          onLoadSuccess(nextPdf);
        }, 0);
      })
      .catch(onLoadError);

    return () => {
      loadingTask.destroy();
    };
  }

  useEffect(loadDocument, [
    onLoadError,
    onLoadProgress,
    onLoadSuccess,
    onPassword,
    options,
    source,
  ]);

  function setupLinkService() {
    linkService.current.setViewer(viewer.current);
    linkService.current.setExternalLinkRel(externalLinkRel);
    linkService.current.setExternalLinkTarget(externalLinkTarget);
  }

  useEffect(setupLinkService, [externalLinkRel, externalLinkTarget]);

  function registerPage(pageIndex, ref) {
    pages.current[pageIndex] = ref;
  }

  function unregisterPage(pageIndex) {
    delete pages.current[pageIndex];
  }

  const childContext = {
    imageResourcesPath,
    linkService: linkService.current,
    pdf,
    registerPage,
    renderMode,
    rotate,
    unregisterPage,
  };

  const eventProps = useMemo(() => makeEventProps(otherProps, () => pdf), [otherProps, pdf]);

  function renderChildren() {
    return <DocumentContext.Provider value={childContext}>{children}</DocumentContext.Provider>;
  }

  function renderContent() {
    if (!file) {
      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null) {
      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false) {
      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
    }

    return renderChildren();
  }

  return (
    <div className={clsx('react-pdf__Document', className)} ref={inputRef} {...eventProps}>
      {renderContent()}
    </div>
  );
});

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
  options: PropTypes.shape({
    cMapUrl: PropTypes.string,
    cMapPacked: PropTypes.bool,
    standardFontDataUrl: PropTypes.string,
  }),
  rotate: PropTypes.number,
};

export default Document;
