import { Suspense, startTransition, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Document, Outline, Page, pdfjs, Thumbnail } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import './Test.css';

import AnnotationOptions from './AnnotationOptions.js';
import CustomRenderer from './CustomRenderer.js';
import LayerOptions from './LayerOptions.js';
import LoadingOptions from './LoadingOptions.js';
import PassingOptions from './PassingOptions.js';
import RenderingOptions from './RenderingOptions.js';
import ViewOptions from './ViewOptions.js';

import { isArrayBuffer, isBlob, isBrowser, loadFromFile } from './shared/utils.js';

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { ExternalLinkTarget, File, PassMethod, RenderMode } from './shared/types.js';

const { PDFDataRangeTransport } = pdfjs;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
  wasmUrl: '/wasm/',
};

export function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        return reject(new Error('Error while reading a file.'));
      }

      resolve(reader.result as string);
    };

    reader.onerror = (event) => {
      if (!event.target) {
        return reject(new Error('Error while reading a file.'));
      }

      const { error } = event.target;

      if (!error) {
        return reject(new Error('Error while reading a file.'));
      }

      switch (error.code) {
        case error.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'));
        case error.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'));
        case error.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'));
        default:
          return reject(new Error('Error while reading a file.'));
      }
    };

    reader.readAsDataURL(file);
  });
}

export default function Test() {
  const [canvasBackground, setCanvasBackground] = useState<string>();
  const [devicePixelRatio, setDevicePixelRatio] = useState<number>();
  const [displayAll, setDisplayAll] = useState(false);
  const [externalLinkTarget, setExternalLinkTarget] = useState<ExternalLinkTarget>();
  const [file, setFile] = useState<File>(null);
  const [fileForProps, setFileForProps] = useState<File>();
  const [suspense, setSuspense] = useState(true);
  const [numPages, setNumPages] = useState<number>();
  const [pageHeight, setPageHeight] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>();
  const [pageScale, setPageScale] = useState<number>();
  const [pageWidth, setPageWidth] = useState<number>();
  const [passMethod, setPassMethod] = useState<PassMethod>();
  const [renderHighContrast, setRenderHighContrast] = useState(false);
  const [documentKey, setDocumentKey] = useState(0);
  const [render, setRender] = useState(true);
  const [renderAnnotationLayer, setRenderAnnotationLayer] = useState(true);
  const [renderForms, setRenderForms] = useState(true);
  const [renderMode, setRenderMode] = useState<RenderMode | undefined>('canvas');
  const [renderTextLayer, setRenderTextLayer] = useState(true);
  const [useCustomTextRenderer, setUseCustomTextRenderer] = useState(true);
  const [rotate, setRotate] = useState<number>();

  const onDocumentLoadProgress = useCallback((progressData: { loaded: number; total: number }) => {
    console.log(`Loading a document: ${(progressData.loaded / progressData.total) * 100}%`);
  }, []);

  const onDocumentLoadSuccess = useCallback((document: PDFDocumentProxy) => {
    console.log('Loaded a document', document);
    const { numPages: nextNumPages } = document;
    setNumPages(nextNumPages);
    setPageNumber(1);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error(error);
  }, []);

  const onPageRenderSuccess = useCallback(
    (page: PDFPageProxy) => console.log('Rendered a page', page),
    [],
  );

  const onPageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, page: PDFPageProxy | false | undefined) =>
      console.log('Clicked a page', { event, page }),
    [],
  );

  const onItemClick = useCallback((args: { pageNumber: number }) => {
    console.log('Clicked an item', args);
    const { pageNumber: nextPageNumber } = args;

    startTransition(() => {
      setPageNumber(nextPageNumber);
    });
  }, []);

  const customTextRenderer = useCallback(
    ({ str }: { str: string }) => str.replace(/ipsum/g, (value) => `<mark>${value}</mark>`),
    [],
  );

  useEffect(() => {
    (async () => {
      const nextFileForProps = await (async () => {
        if (!file) {
          return null;
        }

        switch (passMethod) {
          case 'string': {
            if (typeof file === 'string') {
              return file;
            }

            if (file instanceof File || file instanceof Blob) {
              return readAsDataURL(file);
            }

            return file;
          }
          case 'object': {
            // File is a string
            if (typeof file === 'string') {
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
                return { data: await loadFromFile(file) };
              }
            }
            return file;
          }
          default:
            return file;
        }
      })();

      setFileForProps(nextFileForProps);
    })();
  }, [file, passMethod]);

  const changePage = useCallback((offset: number) => {
    startTransition(() => {
      setPageNumber((prevPageNumber) => (prevPageNumber || 1) + offset);
    });
  }, []);

  const previousPage = useCallback(() => changePage(-1), [changePage]);

  const nextPage = useCallback(() => changePage(1), [changePage]);

  function retryDocument() {
    setDocumentKey((previous) => previous + 1);
  }

  function renderError({ error }: { error: unknown }) {
    return (
      <div role="alert">
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <button onClick={retryDocument} type="button">
          Retry
        </button>
      </div>
    );
  }

  const documentProps = {
    externalLinkTarget,
    file: fileForProps,
    options,
    rotate,
    suspense,
  };

  const pageProps = {
    canvasBackground,
    className: 'custom-classname-page',
    customRenderer: CustomRenderer,
    customTextRenderer: useCustomTextRenderer ? customTextRenderer : undefined,
    devicePixelRatio,
    height: pageHeight,
    onClick: onPageClick,
    onRenderSuccess: onPageRenderSuccess,
    pageColors: renderHighContrast
      ? {
          background: 'black',
          foreground: '#ffff00',
        }
      : undefined,
    renderAnnotationLayer,
    renderForms,
    renderMode,
    renderTextLayer,
    scale: pageScale,
    width: pageWidth,
  };

  return (
    <div className="Test">
      <header>
        <h1>react-pdf test page</h1>
      </header>
      <div className="Test__container">
        <aside className="Test__container__options">
          <LoadingOptions file={file} setFile={setFile} setRender={setRender} />
          <PassingOptions file={file} passMethod={passMethod} setPassMethod={setPassMethod} />
          <RenderingOptions setSuspense={setSuspense} suspense={suspense} />
          <LayerOptions
            renderAnnotationLayer={renderAnnotationLayer}
            renderForms={renderForms}
            renderTextLayer={renderTextLayer}
            useCustomTextRenderer={useCustomTextRenderer}
            setRenderAnnotationLayer={setRenderAnnotationLayer}
            setRenderForms={setRenderForms}
            setRenderTextLayer={setRenderTextLayer}
            setUseCustomTextRenderer={setUseCustomTextRenderer}
          />
          <ViewOptions
            canvasBackground={canvasBackground}
            devicePixelRatio={devicePixelRatio}
            displayAll={displayAll}
            pageHeight={pageHeight}
            pageScale={pageScale}
            pageWidth={pageWidth}
            renderHighContrast={renderHighContrast}
            renderMode={renderMode}
            rotate={rotate}
            setCanvasBackground={setCanvasBackground}
            setDevicePixelRatio={setDevicePixelRatio}
            setDisplayAll={setDisplayAll}
            setPageHeight={setPageHeight}
            setPageScale={setPageScale}
            setPageWidth={setPageWidth}
            setRenderHighContrast={setRenderHighContrast}
            setRenderMode={setRenderMode}
            setRotate={setRotate}
          />
          <AnnotationOptions
            externalLinkTarget={externalLinkTarget}
            setExternalLinkTarget={setExternalLinkTarget}
          />
        </aside>
        <main className="Test__container__content">
          <ErrorBoundary
            fallbackRender={renderError}
            resetKeys={[fileForProps, documentKey, suspense]}
          >
            <Suspense fallback={<p role="status">Loading document…</p>}>
              <Document
                {...documentProps}
                className="custom-classname-document"
                key={documentKey}
                onClick={(
                  event: React.MouseEvent<HTMLDivElement>,
                  pdf: PDFDocumentProxy | false | undefined,
                ) => console.log('Clicked a document', { event, pdf })}
                onItemClick={onItemClick}
                onLoadError={onDocumentLoadError}
                onLoadProgress={onDocumentLoadProgress}
                onLoadSuccess={onDocumentLoadSuccess}
                onSourceError={onDocumentLoadError}
              >
                <div className="Test__container__content__toc">
                  <ErrorBoundary
                    fallbackRender={renderError}
                    resetKeys={[fileForProps, documentKey, suspense]}
                  >
                    <Suspense fallback={<p role="status">Loading outline…</p>}>
                      {render ? <Outline className="custom-classname-outline" /> : null}
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div className="Test__container__content__document">
                  <ErrorBoundary
                    fallbackRender={renderError}
                    resetKeys={[
                      fileForProps,
                      documentKey,
                      suspense,
                      ...Object.values(pageProps),
                      pageNumber,
                      displayAll,
                    ]}
                  >
                    <Suspense fallback={<p role="status">Loading page…</p>}>
                      {render ? (
                        displayAll ? (
                          Array.from(new Array(numPages), (_el, index) => (
                            <Page
                              // biome-ignore lint/suspicious/noArrayIndexKey: index is stable here
                              key={`page_${index + 1}`}
                              {...pageProps}
                              inputRef={
                                pageNumber === index + 1
                                  ? (ref: HTMLDivElement) => {
                                      ref?.scrollIntoView();
                                    }
                                  : null
                              }
                              pageNumber={index + 1}
                            />
                          ))
                        ) : (
                          <Page {...pageProps} pageNumber={pageNumber || 1} />
                        )
                      ) : null}
                    </Suspense>
                  </ErrorBoundary>
                </div>
                {displayAll || (
                  <div className="Test__container__content__controls">
                    <button disabled={(pageNumber || 0) <= 1} onClick={previousPage} type="button">
                      Previous
                    </button>
                    <span>{`Page ${pageNumber || (numPages ? 1 : '--')} of ${numPages || '--'}`}</span>
                    <button
                      disabled={(pageNumber || 0) >= (numPages || 0)}
                      onClick={nextPage}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                )}
                <div className="Test__container__content__thumbnails">
                  <ErrorBoundary
                    fallbackRender={renderError}
                    resetKeys={[fileForProps, documentKey, suspense]}
                  >
                    <Suspense fallback={<p role="status">Loading thumbnails…</p>}>
                      {Array.from(new Array(numPages), (_el, index) => (
                        <Thumbnail
                          // biome-ignore lint/suspicious/noArrayIndexKey: index is stable here
                          key={`thumbnail_${index + 1}`}
                          className="custom-classname-thumbnail"
                          pageNumber={index + 1}
                          width={100}
                        />
                      ))}
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </Document>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
