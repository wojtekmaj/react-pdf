import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Document, Outline, Page } from 'react-pdf/src/entry.webpack';

import './Test.less';

import LoadingOptions from './LoadingOptions';
import ViewOptions from './ViewOptions';

export default class Test extends Component {
  state = {
    displayAll: false,
    file: null,
    numPages: null,
    pageNumber: null,
    pageWidth: null,
    render: true,
    renderTextLayer: true,
    rotate: null,
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({
      numPages,
      pageNumber: null,
    })

  onDocumentLoadError = ({ message }) => {
    // eslint-disable-next-line no-console
    console.error(message);
  }

  onItemClick = ({ pageNumber }) =>
    this.setState({ pageNumber })

  setFile = file => this.setState({ file })

  previousPage = () => this.changePage(-1)

  nextPage = () => this.changePage(1)

  changePage = by =>
    this.setState(prevState => ({
      pageNumber: (prevState.pageNumber || 1) + by,
    }))

  render() {
    const {
      displayAll,
      file,
      numPages,
      pageNumber,
      pageWidth,
      render,
      renderTextLayer,
      rotate,
    } = this.state;

    const setState = state => this.setState(state);

    return (
      <div className="Test">
        <header>
          <h1>react-pdf test page</h1>
        </header>
        <div className="Test__container">
          <aside className="Test__container__options">
            <LoadingOptions
              setFile={this.setFile}
              setState={setState}
            />
            <ViewOptions
              displayAll={displayAll}
              pageWidth={pageWidth}
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
                    file={file}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    onLoadError={this.onDocumentLoadError}
                  >
                    <Outline
                      onItemClick={this.onItemClick}
                    />
                  </Document>
              }
            </div>
            <div className="Test__container__content__document">
              {
                render &&
                  <Document
                    file={file}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    onLoadError={this.onDocumentLoadError}
                    rotate={rotate}
                  >
                    {
                      displayAll ?
                        Array.from(
                          new Array(numPages),
                          (el, index) => (
                            <Page
                              ref={(ref) => {
                                if (!ref) {
                                  return;
                                }

                                if (pageNumber === index + 1) {
                                  const node = findDOMNode(ref);
                                  if (!node) {
                                    return;
                                  }
                                  node.scrollIntoView();
                                }
                              }}
                              key={`page_${index + 1}`}
                              pageNumber={index + 1}
                              renderTextLayer={renderTextLayer}
                              width={pageWidth}
                              onRenderSuccess={this.onPageRenderSuccess}
                            />
                          ),
                        ) :
                        <Page
                          key={`page_${pageNumber}`}
                          pageNumber={pageNumber || 1}
                          renderTextLayer={renderTextLayer}
                          width={pageWidth}
                          onRenderSuccess={this.onPageRenderSuccess}
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
