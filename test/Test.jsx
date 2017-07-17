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
    rotate: null,
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({
      numPages,
      pageNumber: null,
    })

  onDocumentLoadError = ({ errorMessage }) => {
    // eslint-disable-next-line no-console
    console.error(errorMessage);
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
      rotate,
    } = this.state;

    return (
      <div className="Test">
        <header>
          <h1>react-pdf test page</h1>
        </header>
        <div className="Test__container">
          <aside className="Test__container__options">
            <LoadingOptions
              setFile={this.setFile}
            />
            <ViewOptions
              setState={state => this.setState(state)}
              pageWidth={pageWidth}
              rotate={rotate}
            />
          </aside>
          <main className="Test__container__content">
            <div className="Test__container__content__toc">
              <Document
                file={file}
                onLoadSuccess={this.onDocumentLoadSuccess}
                onLoadError={this.onDocumentLoadError}
              >
                <Outline
                  onItemClick={this.onItemClick}
                />
              </Document>
            </div>
            <div className="Test__container__content__document">
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
                          width={pageWidth}
                          onRenderSuccess={this.onPageRenderSuccess}
                        />
                      ),
                    ) :
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber || 1}
                      width={pageWidth}
                      onRenderSuccess={this.onPageRenderSuccess}
                    />
                }
              </Document>
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
