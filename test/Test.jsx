import React, { Component } from 'react';
import { Document, Outline, Page, setOptions } from 'react-pdf/src/entry.webpack';

import './Test.less';

import LoadingOptions from './LoadingOptions';
import ViewOptions from './ViewOptions';

import { dataURItoBlob } from './shared/utils';

setOptions({
  cMapUrl: 'cmaps/',
  cMapPacked: true,
});

/* eslint-disable no-console */

export default class Test extends Component {
  state = {
    displayAll: false,
    file: null,
    numPages: null,
    pageNumber: null,
    pageWidth: null,
    passMethod: 'normal',
    render: true,
    renderAnnotations: true,
    renderMode: 'canvas',
    renderTextLayer: true,
    rotate: null,
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({
      numPages,
      pageNumber: 1,
    })

  onItemClick = ({ pageNumber }) =>
    this.setState({ pageNumber })

  setFile = file => this.setState({ file })

  previousPage = () => this.changePage(-1)

  nextPage = () => this.changePage(1)

  changePage = offset =>
    this.setState(prevState => ({
      pageNumber: (prevState.pageNumber || 1) + offset,
    }))

  get file() {
    const { file } = this.state;
    if (!file) {
      return null;
    }

    switch (this.state.passMethod) {
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

  render() {
    const {
      displayAll,
      numPages,
      pageNumber,
      pageWidth,
      passMethod,
      render,
      renderAnnotations,
      renderMode,
      renderTextLayer,
      rotate,
    } = this.state;
    const { file } = this;

    const setState = state => this.setState(state);

    const pageProps = {
      className: 'custom-classname-page',
      onClick: (event, page) => console.log('Clicked a page', { event, page }),
      onRenderSuccess: this.onPageRenderSuccess,
      renderAnnotations,
      renderMode,
      renderTextLayer,
      width: pageWidth,
    };

    return (
      <div className="Test">
        <header>
          <h1>react-pdf test page</h1>
        </header>
        <div className="Test__container">
          <aside className="Test__container__options">
            <LoadingOptions
              file={this.state.file}
              passMethod={passMethod}
              setFile={this.setFile}
              setState={setState}
            />
            <ViewOptions
              displayAll={displayAll}
              pageWidth={pageWidth}
              renderAnnotations={renderAnnotations}
              renderMode={renderMode}
              renderTextLayer={renderTextLayer}
              rotate={rotate}
              setState={setState}
            />
          </aside>
          <main className="Test__container__content">
            <div className="Test__container__content__toc">
              {
                render &&
                  <Document
                    className="custom-classname-document"
                    file={file}
                  >
                    <Outline
                      className="custom-classname-outline"
                      onItemClick={this.onItemClick}
                    />
                  </Document>
              }
            </div>
            <div className="Test__container__content__document">
              {
                render &&
                  <Document
                    className="custom-classname-document"
                    onItemClick={this.onItemClick}
                    file={file}
                    onClick={(event, pdf) => console.log('Clicked a document', { event, pdf })}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    onLoadError={this.onDocumentLoadError}
                    onSourceError={this.onDocumentLoadError}
                    rotate={rotate}
                  >
                    {
                      displayAll ?
                        Array.from(
                          new Array(numPages),
                          (el, index) => (
                            <Page
                              {...pageProps}
                              inputRef={
                                (pageNumber === index + 1) ?
                                  (ref => ref && ref.scrollIntoView()) :
                                  null
                              }
                              key={`page_${index + 1}`}
                              pageNumber={index + 1}
                            />
                          ),
                        ) :
                        <Page
                          {...pageProps}
                          pageNumber={pageNumber || 1}
                        />
                    }
                  </Document>
              }
            </div>
            {
              displayAll ||
                <div className="Test__container__content__controls">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={this.previousPage}
                  >
                    Previous
                  </button>
                  <span>Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}</span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={this.nextPage}
                  >
                    Next
                  </button>
                </div>
            }
          </main>
        </div>
      </div>
    );
  }
}
