import React, { PureComponent } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Document, Outline, Page } from 'react-pdf/src/entry.webpack';
// eslint-disable-next-line import/no-unresolved
import 'react-pdf/src/Page/AnnotationLayer.css';

import './Test.less';

import AnnotationOptions from './AnnotationOptions';
import LayerOptions from './LayerOptions';
import LoadingOptions from './LoadingOptions';
import ViewOptions from './ViewOptions';

import { dataURItoBlob } from './shared/utils';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

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
    passMethod: 'normal',
    render: true,
    renderAnnotationLayer: true,
    renderInteractiveForms: true,
    renderMode: 'canvas',
    renderTextLayer: true,
    rotate: null,
  }

  onDocumentLoadProgress = (progressData) => {
    console.log('Loading a document', progressData.loaded / progressData.total);
  }

  onDocumentLoadSuccess = (document) => {
    console.log('Loaded a document', document);
    const { numPages } = document;
    this.setState({
      numPages,
      pageNumber: 1,
    });
  }

  onPageRenderSuccess = page => console.log('Rendered a page', page);

  onItemClick = ({ pageNumber }) => this.setState({ pageNumber })

  setFile = file => this.setState({ file })

  previousPage = () => this.changePage(-1)

  nextPage = () => this.changePage(1)

  changePage = offset => this.setState(prevState => ({
    pageNumber: (prevState.pageNumber || 1) + offset,
  }))

  get file() {
    const { file } = this.state;

    if (!file) {
      return null;
    }

    const { passMethod } = this.state;

    switch (passMethod) {
      case 'object': {
        if (typeof file === 'string') {
          return {
            url: file,
          };
        }
        return file;
      }
      case 'blob':
        if (file instanceof File || file instanceof Blob) {
          return file;
        }
        return dataURItoBlob(file);
      case 'normal':
      default:
        return file;
    }
  }

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
      file: fileState,
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
    const { file, pageProps } = this;

    const setState = state => this.setState(state);

    const documentProps = {
      externalLinkTarget,
      file,
      options,
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
              file={fileState}
              passMethod={passMethod}
              setFile={this.setFile}
              setState={setState}
            />
            <LayerOptions
              renderAnnotationLayer={renderAnnotationLayer}
              renderInteractiveForms={renderInteractiveForms}
              renderMode={renderMode}
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
            <div className="Test__container__content__toc">
              {render && (
                <Document
                  {...documentProps}
                  className="custom-classname-document"
                >
                  <Outline
                    className="custom-classname-outline"
                    onItemClick={this.onItemClick}
                  />
                </Document>
              )}
            </div>
            <div className="Test__container__content__document">
              {render && (
                <Document
                  {...documentProps}
                  className="custom-classname-document"
                  onItemClick={this.onItemClick}
                  onClick={(event, pdf) => console.log('Clicked a document', { event, pdf })}
                  onLoadProgress={this.onDocumentLoadProgress}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                  onLoadError={this.onDocumentLoadError}
                  onSourceError={this.onDocumentLoadError}
                  rotate={rotate}
                >
                  {
                    displayAll
                      ? Array.from(
                        new Array(numPages),
                        (el, index) => (
                          <Page
                            {...pageProps}
                            inputRef={
                              (pageNumber === index + 1)
                                ? (ref => ref && ref.scrollIntoView())
                                : null
                            }
                            key={`page_${index + 1}`}
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
                  }
                </Document>
              )}
            </div>
            {displayAll || (
              <div className="Test__container__content__controls">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={this.previousPage}
                >
                  Previous
                </button>
                <span>
                  {`Page ${pageNumber || (numPages ? 1 : '--')} of ${numPages || '--'}`}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= numPages}
                  onClick={this.nextPage}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
}
