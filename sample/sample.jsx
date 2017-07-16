import React, { Component } from 'react';
import { render } from 'react-dom';
import { Document, Page } from 'react-pdf/build/entry.webpack';

import './Sample.less';

class Example extends Component {
  state = {
    file: './sample.pdf',
    pageNumber: 1,
    numPages: null,
  }

  onFileChange = (event) => {
    this.setState({
      file: event.target.files[0],
    });
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  changePage(by) {
    this.setState(prevState => ({
      pageNumber: prevState.pageNumber + by,
    }));
  }

  render() {
    const { file, pageNumber, numPages } = this.state;

    return (
      <div className="Example">
        <h1>react-pdf sample page</h1>
        <div className="Example__container">
          <div className="Example__container__load">
            <label htmlFor="file">Load from file:</label>&nbsp;
            <input
              type="file"
              onChange={this.onFileChange}
            />
          </div>
          <div className="Example__container__preview">
            <Document
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
            >
              <Page
                pageNumber={pageNumber}
                width={300}
              />
            </Document>
          </div>
          <div className="Example__container__controls">
            <button
              disabled={pageNumber <= 1}
              onClick={() => this.changePage(-1)}
            >
              Previous
            </button>
            <span>Page {pageNumber || '--'} of {numPages || '--'}</span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => this.changePage(1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('react-container'));
