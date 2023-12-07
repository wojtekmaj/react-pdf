'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import makeEventProps from 'make-event-props';
import makeCancellable from 'make-cancellable-promise';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import pdfjs from './pdfjs.js';

import DocumentContext from './DocumentContext.js';

import Message from './Message.js';

import LinkService from './LinkService.js';
import PasswordResponses from './PasswordResponses.js';

import {
  cancelRunningTask,
  dataURItoByteString,
  displayCORSWarning,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  loadFromFile,
} from './shared/utils.js';

import useResolver from './shared/hooks/useResolver.js';
import { eventProps, isClassName, isFile, isRef } from './shared/propTypes.js';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { EventProps } from 'make-event-props';
import type {
  ClassName,
  DocumentCallback,
  ExternalLinkRel,
  ExternalLinkTarget,
  File,
  ImageResourcesPath,
  NodeOrRenderer,
  OnDocumentLoadError,
  OnDocumentLoadProgress,
  OnDocumentLoadSuccess,
  OnError,
  OnItemClickArgs,
  OnPasswordCallback,
  Options,
  PasswordResponse,
  RenderMode,
  ScrollPageIntoViewArgs,
  Source,
} from './shared/types.js';

const { PDFDataRangeTransport } = pdfjs;

type OnItemClick = (args: OnItemClickArgs) => void;

type OnPassword = (callback: OnPasswordCallback, reason: PasswordResponse) => void;

type OnSourceError = OnError;

type OnSourceSuccess = () => void;

export type DocumentProps = {
  children?: React.ReactNode;
  /**
   * Class name(s) that will be added to rendered element along with the default `react-pdf__Document`.
   *
   * @example 'custom-class-name-1 custom-class-name-2'
   * @example ['custom-class-name-1', 'custom-class-name-2']
   */
  className?: ClassName;
  /**
   * What the component should display in case of an error.
   *
   * @default 'Failed to load PDF file.'
   * @example 'An error occurred!'
   * @example <p>An error occurred!</p>
   * @example {this.renderError}
   */
  error?: NodeOrRenderer;
  /**
   * Link rel for links rendered in annotations.
   *
   * @default 'noopener noreferrer nofollow'
   */
  externalLinkRel?: ExternalLinkRel;
  /**
   * Link target for external links rendered in annotations.
   */
  externalLinkTarget?: ExternalLinkTarget;
  /**
   * What PDF should be displayed.
   *
   * Its value can be an URL, a file (imported using `import … from …` or from file input form element), or an object with parameters (`url` - URL; `data` - data, preferably Uint8Array; `range` - PDFDataRangeTransport.
   *
   * **Warning**: Since equality check (`===`) is used to determine if `file` object has changed, it must be memoized by setting it in component's state, `useMemo` or other similar technique.
   *
   * @example 'https://example.com/sample.pdf'
   * @example importedPdf
   * @example { url: 'https://example.com/sample.pdf' }
   */
  file?: File;
  /**
   * The path used to prefix the src attributes of annotation SVGs.
   *
   * @default ''
   * @example '/public/images/'
   */
  imageResourcesPath?: ImageResourcesPath;
  /**
   * A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Document>` component.
   *
   * @example (ref) => { this.myDocument = ref; }
   * @example this.ref
   * @example ref
   */
  inputRef?: React.Ref<HTMLDivElement>;
  /**
   * What the component should display while loading.
   *
   * @default 'Loading PDF…'
   * @example 'Please wait!'
   * @example <p>Please wait!</p>
   * @example {this.renderLoader}
   */
  loading?: NodeOrRenderer;
  /**
   * What the component should display in case of no data.
   *
   * @default 'No PDF file specified.'
   * @example 'Please select a file.'
   * @example <p>Please select a file.</p>
   * @example {this.renderNoData}
   */
  noData?: NodeOrRenderer;
  /**
   * Function called when an outline item or a thumbnail has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.
   *
   * @example ({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')
   */
  onItemClick?: OnItemClick;
  /**
   * Function called in case of an error while loading a document.
   *
   * @example (error) => alert('Error while loading document! ' + error.message)
   */
  onLoadError?: OnDocumentLoadError;
  /**
   * Function called, potentially multiple times, as the loading progresses.
   *
   * @example ({ loaded, total }) => alert('Loading a document: ' + (loaded / total) * 100 + '%')
   */
  onLoadProgress?: OnDocumentLoadProgress;
  /**
   * Function called when the document is successfully loaded.
   *
   * @example (pdf) => alert('Loaded a file with ' + pdf.numPages + ' pages!')
   */
  onLoadSuccess?: OnDocumentLoadSuccess;
  /**
   * Function called when a password-protected PDF is loaded.
   *
   * @example (callback) => callback('s3cr3t_p4ssw0rd')
   */
  onPassword?: OnPassword;
  /**
   * Function called in case of an error while retrieving document source from `file` prop.
   *
   * @example (error) => alert('Error while retrieving document source! ' + error.message)
   */
  onSourceError?: OnSourceError;
  /**
   * Function called when document source is successfully retrieved from `file` prop.
   *
   * @example () => alert('Document source retrieved!')
   */
  onSourceSuccess?: OnSourceSuccess;
  /**
   * An object in which additional parameters to be passed to PDF.js can be defined. Most notably:
   * - `cMapUrl`;
   * - `httpHeaders` - custom request headers, e.g. for authorization);
   * - `withCredentials` - a boolean to indicate whether or not to include cookies in the request (defaults to `false`)
   *
   * For a full list of possible parameters, check [PDF.js documentation on DocumentInitParameters](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters).
   *
   * **Note**: Make sure to define options object outside of your React component, and use `useMemo` if you can't.
   *
   * @example { cMapUrl: '/cmaps/' }
   */
  options?: Options;
  /**
   * Rendering mode of the document. Can be `"canvas"`, `"custom"`, `"none"` or `"svg"`. If set to `"custom"`, `customRenderer` must also be provided.
   *
   * **Warning**: SVG render mode is no longer maintained and may be removed in the future.
   *
   * @default 'canvas'
   * @example 'svg'
   */
  renderMode?: RenderMode;
  /**
   * Rotation of the document in degrees. If provided, will change rotation globally, even for the pages which were given `rotate` prop of their own. `90` = rotated to the right, `180` = upside down, `270` = rotated to the left.
   *
   * @example 90
   */
  rotate?: number | null;
} & EventProps<DocumentCallback | false | undefined>;

const defaultOnPassword: OnPassword = (callback, reason) => {
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
};

/**
 * Loads a document passed using `file` prop.
 */
const Document = forwardRef(function Document(
  {
    children,
    className,
    error = 'Failed to load PDF file.',
    externalLinkRel,
    externalLinkTarget,
    file,
    inputRef,
    imageResourcesPath,
    loading = 'Loading PDF…',
    noData = 'No PDF file specified.',
    onItemClick,
    onLoadError: onLoadErrorProps,
    onLoadProgress,
    onLoadSuccess: onLoadSuccessProps,
    onPassword = defaultOnPassword,
    onSourceError: onSourceErrorProps,
    onSourceSuccess: onSourceSuccessProps,
    options,
    renderMode,
    rotate,
    ...otherProps
  }: DocumentProps,
  ref,
) {
  const [sourceState, sourceDispatch] = useResolver<Source | null>();
  const { value: source, error: sourceError } = sourceState;
  const [pdfState, pdfDispatch] = useResolver<PDFDocumentProxy>();
  const { value: pdf, error: pdfError } = pdfState;

  const linkService = useRef(new LinkService());

  const pages = useRef<HTMLDivElement[]>([]);

  const viewer = useRef({
    // Handling jumping to internal links target
    scrollPageIntoView: (args: ScrollPageIntoViewArgs) => {
      const { dest, pageNumber, pageIndex = pageNumber - 1 } = args;

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
    () => ({
      linkService,
      pages,
      viewer,
    }),
    [],
  );

  /**
   * Called when a document source is resolved correctly
   */
  function onSourceSuccess() {
    if (onSourceSuccessProps) {
      onSourceSuccessProps();
    }
  }

  /**
   * Called when a document source failed to be resolved correctly
   */
  function onSourceError() {
    if (!sourceError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, sourceError.toString());

    if (onSourceErrorProps) {
      onSourceErrorProps(sourceError);
    }
  }

  function resetSource() {
    sourceDispatch({ type: 'RESET' });
  }

  useEffect(resetSource, [file, sourceDispatch]);

  const findDocumentSource = useCallback(async (): Promise<Source | null> => {
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
      if (isBlob(file)) {
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
      'data' in file || 'range' in file || 'url' in file,
      'Invalid parameter object: need either .data, .range or .url',
    );

    // File .url is a string
    if ('url' in file && typeof file.url === 'string') {
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
        sourceDispatch({ type: 'RESOLVE', value: nextSource });
      })
      .catch((error) => {
        sourceDispatch({ type: 'REJECT', error });
      });

    return () => {
      cancelRunningTask(cancellable);
    };
  }, [findDocumentSource, sourceDispatch]);

  useEffect(
    () => {
      if (typeof source === 'undefined') {
        return;
      }

      if (source === false) {
        onSourceError();
        return;
      }

      onSourceSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  );

  /**
   * Called when a document is read successfully
   */
  function onLoadSuccess() {
    if (!pdf) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    if (onLoadSuccessProps) {
      onLoadSuccessProps(pdf);
    }

    pages.current = new Array(pdf.numPages);
    linkService.current.setDocument(pdf);
  }

  /**
   * Called when a document failed to read successfully
   */
  function onLoadError() {
    if (!pdfError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, pdfError.toString());

    if (onLoadErrorProps) {
      onLoadErrorProps(pdfError);
    }
  }

  function resetDocument() {
    pdfDispatch({ type: 'RESET' });
  }

  useEffect(resetDocument, [pdfDispatch, source]);

  function loadDocument() {
    if (!source) {
      return;
    }

    const documentInitParams = options
      ? {
          ...source,
          ...options,
        }
      : source;

    const destroyable = pdfjs.getDocument(documentInitParams);
    if (onLoadProgress) {
      destroyable.onProgress = onLoadProgress;
    }
    if (onPassword) {
      destroyable.onPassword = onPassword;
    }
    const loadingTask = destroyable;

    loadingTask.promise
      .then((nextPdf) => {
        pdfDispatch({ type: 'RESOLVE', value: nextPdf });
      })
      .catch((error) => {
        if (loadingTask.destroyed) {
          return;
        }

        pdfDispatch({ type: 'REJECT', error });
      });

    return () => {
      loadingTask.destroy();
    };
  }

  useEffect(
    loadDocument,
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, pdfDispatch, source],
  );

  useEffect(
    () => {
      if (typeof pdf === 'undefined') {
        return;
      }

      if (pdf === false) {
        onLoadError();
        return;
      }

      onLoadSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pdf],
  );

  function setupLinkService() {
    linkService.current.setViewer(viewer.current);
    linkService.current.setExternalLinkRel(externalLinkRel);
    linkService.current.setExternalLinkTarget(externalLinkTarget);
  }

  useEffect(setupLinkService, [externalLinkRel, externalLinkTarget]);

  function registerPage(pageIndex: number, ref: HTMLDivElement) {
    pages.current[pageIndex] = ref;
  }

  function unregisterPage(pageIndex: number) {
    delete pages.current[pageIndex];
  }

  const childContext = useMemo(
    () => ({
      imageResourcesPath,
      linkService: linkService.current,
      onItemClick,
      pdf,
      registerPage,
      renderMode,
      rotate,
      unregisterPage,
    }),
    [imageResourcesPath, onItemClick, pdf, renderMode, rotate],
  );

  const eventProps = useMemo(() => makeEventProps(otherProps, () => pdf), [otherProps, pdf]);

  function renderChildren() {
    return <DocumentContext.Provider value={childContext}>{children}</DocumentContext.Provider>;
  }

  function renderContent() {
    if (!file) {
      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === undefined || pdf === null) {
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
    <div
      className={clsx('react-pdf__Document', className)}
      ref={inputRef}
      style={{
        ['--scale-factor' as string]: '1',
      }}
      {...eventProps}
    >
      {renderContent()}
    </div>
  );
});

const isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);

Document.propTypes = {
  ...eventProps,
  children: PropTypes.node,
  className: isClassName,
  error: isFunctionOrNode,
  externalLinkRel: PropTypes.string,
  externalLinkTarget: PropTypes.oneOf(['_self', '_blank', '_parent', '_top'] as const),
  file: isFile,
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
    canvasFactory: PropTypes.any,
    canvasMaxAreaInBytes: PropTypes.number,
    cMapPacked: PropTypes.bool,
    CMapReaderFactory: PropTypes.any,
    cMapUrl: PropTypes.string,
    disableAutoFetch: PropTypes.bool,
    disableFontFace: PropTypes.bool,
    disableRange: PropTypes.bool,
    disableStream: PropTypes.bool,
    docBaseUrl: PropTypes.string,
    enableXfa: PropTypes.bool,
    filterFactory: PropTypes.any,
    fontExtraProperties: PropTypes.bool,
    httpHeaders: PropTypes.object,
    isEvalSupported: PropTypes.bool,
    isOffscreenCanvasSupported: PropTypes.bool,
    length: PropTypes.number,
    maxImageSize: PropTypes.number,
    ownerDocument: PropTypes.any,
    password: PropTypes.string,
    pdfBug: PropTypes.bool,
    rangeChunkSize: PropTypes.number,
    StandardFontDataFactory: PropTypes.any,
    standardFontDataUrl: PropTypes.string,
    stopAtErrors: PropTypes.bool,
    useSystemFonts: PropTypes.bool,
    useWorkerFetch: PropTypes.bool,
    verbosity: PropTypes.number,
    withCredentials: PropTypes.bool,
    worker: PropTypes.any,
  }),
  rotate: PropTypes.number,
};

export default Document;
