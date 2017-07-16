import React, { Component } from 'react';
import { Document, Page } from 'react-pdf/src/entry.webpack';

import './Test.less';

import samplePDF from './test.pdf';

let componentRenderCount = 0;

class WrappedDocument extends Document {
  componentDidMount() {
    super.componentDidMount();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
  }

  componentWillUpdate() {
    componentRenderCount += 1;
  }
}

WrappedDocument.propTypes = Document.propTypes;

WrappedDocument.displayName = 'Wrapped(Document)';

export default class Test extends Component {
  state = {
    displayAll: false,
    file: null,
    numPages: null,
    pageNumber: 1,
    pageRenderCount: 0,
    pageWidth: null,
    passObj: false,
    rotate: null,
  }

  onFileChange = (event) => {
    this.setState({
      file: event.target.files[0],
    });
  }

  onFileUintChange = (event) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      this.setState({
        file: reader.result,
      });
    };

    reader.readAsArrayBuffer(event.target.files[0]);
  }

  onURLChange = (event) => {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    this.setState({
      file: url,
    });
  }

  onRequestChange = (event) => {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    fetch(url).then(response => response.blob()).then((blob) => {
      this.setState({
        file: blob,
      });
    });
  }

  onUseImported = () =>
    this.setState({ file: samplePDF })

  onPassObjChange = event =>
    this.setState({ passObj: event.target.checked })

  onDisplayAllChange = event =>
    this.setState({ displayAll: event.target.checked })

  onPageWidthChange = (event) => {
    event.preventDefault();

    const form = event.target;

    const width = form.pageWidth.value;

    if (!width) {
      return;
    }

    this.setState({
      pageWidth: parseInt(width, 10),
    });
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({ numPages })

  onDocumentLoadError = ({ errorMessage }) => {
    // eslint-disable-next-line no-console
    console.error(errorMessage);
  }

  onPageRenderSuccess = () =>
    this.setState(prevState => ({ pageRenderCount: prevState.pageRenderCount + 1 }))

  unloadFile = () => this.setState({ file: null })

  rotateLeft = () => this.setState(prevState => ({ rotate: (prevState.rotate - 90) % 360 }))

  rotateRight = () => this.setState(prevState => ({ rotate: (prevState.rotate + 90) % 360 }))

  resetRotation = () => this.setState({ rotate: null })

  resetWidth = () => this.setState({ pageWidth: null })

  get transformedFile() {
    if (!this.state.passObj) {
      return this.state.file;
    }

    const result = {};
    if (typeof this.state.file === 'string') {
      result.url = this.state.file;
    } else {
      return this.state.file;
    }
    return result;
  }

  changePage(by) {
    this.setState(prevState => ({
      pageNumber: prevState.pageNumber + by,
    }));
  }

  render() {
    const {
      displayAll,
      numPages,
      pageNumber,
      pageRenderCount,
      pageWidth,
      rotate,
    } = this.state;

    return (
      <div className="Example">
        <h1>react-pdf test page</h1>
        <div className="Example__container">
          <div className="Example__container__options">
            <fieldset id="load">
              <legend htmlFor="load">Load file</legend>

              <label htmlFor="file">Load from file:</label>&nbsp;
              <input
                type="file"
                onChange={this.onFileChange}
              />
              <br />
              <br />

              <label htmlFor="file">Load from file to Uint8Array:</label>&nbsp;
              <input
                type="file"
                onChange={this.onFileUintChange}
              />
              <br />
              <br />

              <form onSubmit={this.onURLChange}>
                <label htmlFor="url">Load from URL:</label>&nbsp;
                <input type="text" />
                <button type="submit">Apply</button>
              </form>
              <br />

              <form onSubmit={this.onRequestChange}>
                <label htmlFor="url">Fetch and pass:</label>&nbsp;
                <input type="text" />
                <button type="submit">Apply</button>
              </form>
              <br />

              <button onClick={this.onUseImported}>Use imported file</button>
              <br />
              <br />

              <input id="passobj" type="checkbox" onChange={this.onPassObjChange} />
              <label htmlFor="passobj">Pass as an object (URLs and imports only)</label>
              <br />
              <br />

              <button
                disabled={this.transformedFile === null}
                onClick={this.unloadFile}
              >
                Unload file
              </button>
            </fieldset>

            <fieldset id="viewoptions">
              <legend htmlFor="viewoptions">View options</legend>

              <form onSubmit={this.onPageWidthChange}>
                <label htmlFor="pageWidth">Page width:</label>&nbsp;
                <input
                  type="number"
                  name="pageWidth"
                  defaultValue={pageWidth}
                />&nbsp;
                <button
                  style={{ display: 'none' }}
                  type="submit"
                >
                  Set width
                </button>
                <button
                  disabled={pageWidth === null}
                  onClick={this.resetWidth}
                  type="button"
                >
                  Reset width
                </button>
              </form>
              <br />

              <button onClick={this.rotateLeft}>Rotate left</button>&nbsp;
              <button onClick={this.rotateRight}>Rotate right</button>&nbsp;
              <button
                disabled={rotate === null}
                onClick={this.resetRotation}
              >
                Reset rotation
              </button>
              <br />
              <br />

              <input id="displayAll" type="checkbox" onChange={this.onDisplayAllChange} />
              <label htmlFor="displayAll">View all pages</label>
            </fieldset>
          </div>
          <div className="Example__container__preview">
            <div className="Example__container__preview__out">
              <WrappedDocument
                file={this.transformedFile}
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
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          width={pageWidth}
                          onRenderSuccess={this.onPageRenderSuccess}
                        />
                      ),
                    ) :
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber}
                      width={pageWidth}
                      onRenderSuccess={this.onPageRenderSuccess}
                    />
                }
              </WrappedDocument>
            </div>
            {
              displayAll ||
                <div className="Example__container__preview__controls">
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
            }
            <div className="Example__container__preview__info">
              Page render count: {pageRenderCount}<br />
              Component render count: {componentRenderCount}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
