import { useCallback, useEffect, useState } from 'react';
import { pdfjs, Document, Outline, Page, Thumbnail } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import './Test.css';

import AnnotationOptions from './AnnotationOptions.js';
import LayerOptions from './LayerOptions.js';
import LoadingOptions from './LoadingOptions.js';
import PassingOptions from './PassingOptions.js';
import ViewOptions from './ViewOptions.js';
import CustomRenderer from './CustomRenderer.js';

import { isArrayBuffer, isBlob, isBrowser, loadFromFile, dataURItoBlob } from './shared/utils.js';

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { ExternalLinkTarget, File, PassMethod, RenderMode } from './shared/types.js';

const { PDFDataRangeTransport } = pdfjs;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
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

/* eslint-disable no-console */

export default function Test() {
  const [canvasBackground, setCanvasBackground] = useState<string>();
  const [devicePixelRatio, setDevicePixelRatio] = useState<number>();
  const [displayAll, setDisplayAll] = useState(false);
  const [externalLinkTarget, setExternalLinkTarget] = useState<ExternalLinkTarget>();
  const [file, setFile] = useState<File>(null);
  const [fileForProps, setFileForProps] = useState<File>();
  const [numPages, setNumPages] = useState<number>();
  const [pageHeight, setPageHeight] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>();
  const [pageScale, setPageScale] = useState<number>();
  const [pageWidth, setPageWidth] = useState<number>();
  const [passMethod, setPassMethod] = useState<PassMethod>();
  const [render, setRender] = useState(true);
  const [renderAnnotationLayer, setRenderAnnotationLayer] = useState(true);
  const [renderForms, setRenderForms] = useState(true);
  const [renderMode, setRenderMode] = useState<RenderMode | undefined>('canvas');
  const [renderTextLayer, setRenderTextLayer] = useState(true);
  const [useCustomTextRenderer, setUseCustomTextRenderer] = useState(true);
  const [rotate, setRotate] = useState<number>();

  const onDocumentLoadProgress = useCallback((progressData: { loaded: number; total: number }) => {
    console.log(
      'Loading a document',
      progressData.total ? progressData.loaded / progressData.total : '(unknown progress)',
    );
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
    setPageNumber(nextPageNumber);
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
          case 'blob': {
            if (typeof file === 'string') {
              return dataURItoBlob(file);
            }

            if (file instanceof File || file instanceof Blob) {
              return file;
            }

            return file;
          }

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

  const changePage = useCallback(
    (offset: number) => setPageNumber((prevPageNumber) => (prevPageNumber || 1) + offset),
    [],
  );

  const previousPage = useCallback(() => changePage(-1), [changePage]);

  const nextPage = useCallback(() => changePage(1), [changePage]);

  const documentProps = {
    externalLinkTarget,
    file: fileForProps,
    options,
    rotate,
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
            renderMode={renderMode}
            rotate={rotate}
            setCanvasBackground={setCanvasBackground}
            setDevicePixelRatio={setDevicePixelRatio}
            setDisplayAll={setDisplayAll}
            setPageHeight={setPageHeight}
            setPageScale={setPageScale}
            setPageWidth={setPageWidth}
            setRenderMode={setRenderMode}
            setRotate={setRotate}
          />
          <AnnotationOptions
            externalLinkTarget={externalLinkTarget}
            setExternalLinkTarget={setExternalLinkTarget}
          />
        </aside>
        <main className="Test__container__content">
          <Document
            {...documentProps}
            className="custom-classname-document"
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
              {render ? <Outline className="custom-classname-outline" /> : null}
            </div>
            <div className="Test__container__content__document">
              {render ? (
                displayAll ? (
                  Array.from(new Array(numPages), (el, index) => (
                    <Page
                      {...pageProps}
                      key={`page_${index + 1}`}
                      inputRef={
                        pageNumber === index + 1 ? (ref) => ref && ref.scrollIntoView() : null
                      }
                      pageNumber={index + 1}
                    />
                  ))
                ) : (
                  <Page {...pageProps} pageNumber={pageNumber || 1} />
                )
              ) : null}
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
              {Array.from(new Array(numPages), (el, index) => (
                <Thumbnail
                  key={`thumbnail_${index + 1}`}
                  className="custom-classname-thumbnail"
                  pageNumber={index + 1}
                  width={100}
                />
              ))}
            </div>
          </Document>
        </main>
      </div>
    </div>
  );
}
