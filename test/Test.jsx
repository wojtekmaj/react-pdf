import React, { useCallback, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PDFDataRangeTransport } from 'pdfjs-dist';
import { Document, Outline, Page } from 'react-pdf/src/entry.webpack';
import 'react-pdf/src/Page/AnnotationLayer.css';

import {
  isArrayBuffer,
  isBlob,
  isBrowser,
  isFile,
  loadFromFile,
} from 'react-pdf/src/shared/utils';

import './Test.less';

import AnnotationOptions from './AnnotationOptions';
import LayerOptions from './LayerOptions';
import LoadingOptions from './LoadingOptions';
import PassingOptions from './PassingOptions';
import ViewOptions from './ViewOptions';

import { dataURItoBlob } from './shared/utils';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

export const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => resolve(reader.result);
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
  reader.readAsDataURL(file);

  return null;
});

/* eslint-disable no-console */

export default function Test() {
  const [displayAll, setDisplayAll] = useState(false);
  const [externalLinkTarget, setExternalLinkTarget] = useState(null);
  const [file, setFile] = useState(null);
  const [fileForProps, setFileForProps] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageHeight, setPageHeight] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [pageScale, setPageScale] = useState(null);
  const [pageWidth, setPageWidth] = useState(null);
  const [passMethod, setPassMethod] = useState(null);
  const [render, setRender] = useState(true);
  const [renderAnnotationLayer, setRenderAnnotationLayer] = useState(true);
  const [renderInteractiveForms, setRenderInteractiveForms] = useState(true);
  const [renderMode, setRenderMode] = useState('canvas');
  const [renderTextLayer, setRenderTextLayer] = useState(true);
  const [rotate, setRotate] = useState(null);

  const onDocumentLoadProgress = useCallback((progressData) => {
    console.log('Loading a document', progressData.total ? progressData.loaded / progressData.total : '(unknown progress)');
  }, []);

  const onDocumentLoadSuccess = useCallback((document) => {
    console.log('Loaded a document', document);
    const { numPages: nextNumPages } = document;
    setNumPages(nextNumPages);
    setPageNumber(1);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error(error);
  }, []);

  const onPageRenderSuccess = useCallback((page) => console.log('Rendered a page', page), []);

  const onItemClick = useCallback(
    (item) => {
      console.log('Clicked an item', item);
      setPageNumber(item.pageNumber);
    },
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
              if (isBlob(file) || isFile(file)) {
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
    (offset) => setPageNumber((prevPageNumber) => (prevPageNumber || 1) + offset),
    [],
  );

  const previousPage = useCallback(() => changePage(-1), [changePage]);

  const nextPage = useCallback(() => changePage(1), [changePage]);

  function getPageProps() {
    return {
      className: 'custom-classname-page',
      height: pageHeight,
      onClick: (event, page) => console.log('Clicked a page', { event, page }),
      onRenderSuccess: onPageRenderSuccess,
      renderAnnotationLayer,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
      scale: pageScale,
      width: pageWidth,
      customTextRenderer: (textItem) => (
        textItem.str
          .split('ipsum')
          .reduce((strArray, currentValue, currentIndex) => (
            currentIndex === 0
              ? ([...strArray, currentValue])
              : ([...strArray, (
                // eslint-disable-next-line react/no-array-index-key
                <mark key={currentIndex}>
                  ipsum
                </mark>
              ), currentValue])
          ), [])
      ),
    };
  }

  const pageProps = getPageProps();

  const documentProps = {
    externalLinkTarget,
    file: fileForProps,
    options,
    rotate,
  };

  return (
    <div className="Test">
      <header>
        <h1>
          react-pdf test page
        </h1>
      </header>
      <div className="Test__container">
        <aside className="Test__container__options">
          <LoadingOptions
            file={file}
            setFile={setFile}
            setRender={setRender}
          />
          <PassingOptions
            file={file}
            passMethod={passMethod}
            setPassMethod={setPassMethod}
          />
          <LayerOptions
            renderAnnotationLayer={renderAnnotationLayer}
            renderInteractiveForms={renderInteractiveForms}
            renderTextLayer={renderTextLayer}
            setRenderAnnotationLayer={setRenderAnnotationLayer}
            setRenderInteractiveForms={setRenderInteractiveForms}
            setRenderTextLayer={setRenderTextLayer}
          />
          <ViewOptions
            displayAll={displayAll}
            pageHeight={pageHeight}
            pageScale={pageScale}
            pageWidth={pageWidth}
            renderMode={renderMode}
            rotate={rotate}
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
            onClick={(event, pdf) => console.log('Clicked a document', { event, pdf })}
            onItemClick={onItemClick}
            onLoadError={onDocumentLoadError}
            onLoadProgress={onDocumentLoadProgress}
            onLoadSuccess={onDocumentLoadSuccess}
            onSourceError={onDocumentLoadError}
          >
            <div className="Test__container__content__toc">
              {render && (
                <Outline
                  className="custom-classname-outline"
                  onItemClick={onItemClick}
                />
              )}
            </div>
            <div className="Test__container__content__document">
              {render && (
                displayAll
                  ? Array.from(
                    new Array(numPages),
                    (el, index) => (
                      <Page
                        {...pageProps}
                        key={`page_${index + 1}`}
                        inputRef={
                          (pageNumber === index + 1)
                            ? ((ref) => ref && ref.scrollIntoView())
                            : null
                        }
                        pageNumber={index + 1}
                      />
                    ),
                  )
                  : (
                    <Page
                      {...pageProps}
                      pageNumber={pageNumber || 1}
                    />
                  )
              )}
            </div>
            {displayAll || (
              <div className="Test__container__content__controls">
                <button
                  disabled={pageNumber <= 1}
                  onClick={previousPage}
                  type="button"
                >
                  Previous
                </button>
                <span>
                  {`Page ${pageNumber || (numPages ? 1 : '--')} of ${numPages || '--'}`}
                </span>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={nextPage}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </Document>
        </main>
      </div>
    </div>
  );
}
