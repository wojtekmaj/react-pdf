import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PDFDataRangeTransport } from 'pdfjs-dist';
import { Document, Outline, Page } from 'react-pdf/src/entry.webpack';
import 'react-pdf/src/Page/AnnotationLayer.css';

import './Test.less';

import AnnotationOptions from './AnnotationOptions';
import LayerOptions from './LayerOptions';
import LoadingOptions from './LoadingOptions';
import PassingOptions from './PassingOptions';
import ViewOptions from './ViewOptions';

import { dataURItoBlob } from './shared/utils';
import {
  isArrayBuffer,
  isBlob,
  isBrowser,
  isFile,
  loadFromFile,
} from '../src/shared/utils';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

export const readAsDataURL = file => new Promise((resolve, reject) => {
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

export default class Test extends PureComponent {
  state = {
    displayAll: false,
    externalLinkTarget: null,
    file: null,
    numPages: null,
    pageHeight: null,
    pageNumber: null,
    pageScale: null,
    pageWidth: null,
    passMethod: null,
    render: true,
    renderAnnotationLayer: true,
    renderInteractiveForms: true,
    renderMode: 'canvas',
    renderTextLayer: true,
    rotate: null,
  };

  onDocumentLoadProgress = (progressData) => {
    console.log('Loading a document', progressData.total ? progressData.loaded / progressData.total : '(unknown progress)');
  };

  onDocumentLoadSuccess = (document) => {
    console.log('Loaded a document', document);
    const { numPages } = document;
    this.setState({
      numPages,
      pageNumber: 1,
    });
  };

  onPageRenderSuccess = page => console.log('Rendered a page', page);

  onItemClick = ({ pageNumber }) => this.setState({ pageNumber });

  setFile = file => this.setState({ file }, this.setFileForProps);

  setPassMethod = passMethod => this.setState({ passMethod }, this.setFileForProps);

  setFileForProps = async () => {
    const fileForProps = await (async () => {
      const { file } = this.state;

      if (!file) {
        return null;
      }

      const { passMethod } = this.state;

      switch (passMethod) {
        case 'blob': {
          if (file instanceof File || file instanceof Blob) {
            return file;
          }
          return dataURItoBlob(file);
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

    this.setState({ fileForProps });
  }

  previousPage = () => this.changePage(-1);

  nextPage = () => this.changePage(1);

  changePage = offset => this.setState(prevState => ({
    pageNumber: (prevState.pageNumber || 1) + offset,
  }));

  get pageProps() {
    const {
      pageHeight,
      pageScale,
      pageWidth,
      renderAnnotationLayer,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
    } = this.state;

    return {
      className: 'custom-classname-page',
      height: pageHeight,
      onClick: (event, page) => console.log('Clicked a page', { event, page }),
      onRenderSuccess: this.onPageRenderSuccess,
      renderAnnotationLayer,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
      scale: pageScale,
      width: pageWidth,
      customTextRenderer: textItem => (
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

  render() {
    const {
      displayAll,
      externalLinkTarget,
      file,
      fileForProps,
      numPages,
      pageHeight,
      pageNumber,
      pageScale,
      pageWidth,
      passMethod,
      render,
      renderAnnotationLayer,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
      rotate,
    } = this.state;
    const { pageProps } = this;

    const setState = state => this.setState(state);

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
              setFile={this.setFile}
              setState={setState}
            />
            <PassingOptions
              file={file}
              passMethod={passMethod}
              setPassMethod={this.setPassMethod}
            />
            <LayerOptions
              renderAnnotationLayer={renderAnnotationLayer}
              renderInteractiveForms={renderInteractiveForms}
              renderTextLayer={renderTextLayer}
              setState={setState}
            />
            <ViewOptions
              displayAll={displayAll}
              pageHeight={pageHeight}
              pageScale={pageScale}
              pageWidth={pageWidth}
              renderMode={renderMode}
              rotate={rotate}
              setState={setState}
            />
            <AnnotationOptions
              externalLinkTarget={externalLinkTarget}
              setState={setState}
            />
          </aside>
          <main className="Test__container__content">
            <Document
              {...documentProps}
              className="custom-classname-document"
              onClick={(event, pdf) => console.log('Clicked a document', { event, pdf })}
              onItemClick={this.onItemClick}
              onLoadError={this.onDocumentLoadError}
              onLoadProgress={this.onDocumentLoadProgress}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onSourceError={this.onDocumentLoadError}
            >
              <div className="Test__container__content__toc">
                {render && (
                  <Outline
                    className="custom-classname-outline"
                    onItemClick={this.onItemClick}
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
                              ? (ref => ref && ref.scrollIntoView())
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
                    onClick={this.previousPage}
                    type="button"
                  >
                    Previous
                  </button>
                  <span>
                    {`Page ${pageNumber || (numPages ? 1 : '--')} of ${numPages || '--'}`}
                  </span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={this.nextPage}
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
}
