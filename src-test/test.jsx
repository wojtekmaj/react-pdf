import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactPDF from '../src/react-pdf';

import './test.less';

import samplePDF from './test.pdf';

class Test extends Component {
    state = {
        file: null,
        pageIndex: null,
        pageNumber: null,
        passObj: false,
        total: null,
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

        this.setState({
            file: event.target.querySelector('input').value,
        });
    }

    onRequestChange = (event) => {
        event.preventDefault();

        const url = event.target.querySelector('input').value;

        fetch(url).then(response => response.blob()).then((blob) => {
            this.setState({
                file: blob,
            });
        });
    }

    onUseImported = () => {
        this.setState({
            file: samplePDF,
        });
    }

    onPassObjChange = (event) => {
        this.setState({ passObj: event.target.checked });
    }

    onDocumentLoad = ({ total }) => {
        this.setState({ total });
    }

    onPageLoad = ({ pageIndex, pageNumber }) => {
        this.setState({ pageIndex, pageNumber });
    }

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
        const newPageIndex = this.state.pageIndex + by;

        this.setState({
            pageIndex: newPageIndex,
        });
    }

    render() {
        const { pageIndex, pageNumber, total } = this.state;

        return (
            <div className="Example">
                <h1>react-pdf test page</h1>
                <div className="Example__container">
                    <div className="Example__container__load">
                        <label htmlFor="file">Load from file:</label>&nbsp;
                        <input
                            type="file"
                            onChange={this.onFileChange}
                        />
                        <br /><br />
                        <label htmlFor="file">Load from file to Uint8Array:</label>&nbsp;
                        <input
                            type="file"
                            onChange={this.onFileUintChange}
                        />
                        <br /><br />
                        <form onSubmit={this.onURLChange}>
                            <label htmlFor="url">Load from URL:</label>&nbsp;
                            <input
                                type="text"
                            />
                            <button type="submit">Apply</button>
                        </form>
                        <br />
                        <form onSubmit={this.onRequestChange}>
                            <label htmlFor="url">Fetch and pass:</label>&nbsp;
                            <input
                                type="text"
                            />
                            <button type="submit">Apply</button>
                        </form>
                        <br />
                        <button onClick={this.onUseImported}>Use imported file</button>
                        <br /><br />
                        <input id="passobj" type="checkbox" onChange={this.onPassObjChange} />
                        <label htmlFor="passobj">Pass as an object (URLs and imports only)</label>
                    </div>
                    <div className="Example__container__preview">
                        <div className="Example__container__preview__out">
                            <ReactPDF
                                file={this.transformedFile}
                                onDocumentLoad={this.onDocumentLoad}
                                onPageLoad={this.onPageLoad}
                                pageIndex={pageIndex}
                            />
                        </div>
                        <div className="Example__container__preview__controls">
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => this.changePage(-1)}
                            >
                                Previous
                            </button>
                            <span>Page {pageNumber || '--'} of {total || '--'}</span>
                            <button
                                disabled={pageNumber >= total}
                                onClick={() => this.changePage(1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Test />, document.getElementById('react-container'));
