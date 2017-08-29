import React, { Component } from 'react';
import PropTypes from 'prop-types';

import samplePDF from './test.pdf';

export default class LoadingOptions extends Component {
  onFileChange = (event) => {
    this.setState(
      { file: event.target.files[0] },
      this.setFile,
    );
  }

  onFileUintChange = (event) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      this.setState(
        { file: reader.result },
        this.setFile,
      );
    };

    reader.readAsArrayBuffer(event.target.files[0]);
  }

  onURLChange = (event) => {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    this.setState(
      { file: url },
      this.setFile,
    );
  }

  onRequestChange = (event) => {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    fetch(url).then(response => response.blob()).then((blob) => {
      this.setState(
        { file: blob },
        this.setFile,
      );
    });
  }

  onUseImported = () =>
    this.setState(
      { file: samplePDF },
      this.setFile,
    )

  onImportAndUnmount = () => {
    this.setState(
      { file: samplePDF },
      this.setFile,
    );

    setTimeout(
      () => this.props.setState({
        render: false,
      }), 20);

    setTimeout(
      () => this.props.setState({
        render: true,
      }), 1000);
  }

  onPassObjChange = event =>
    this.setState(
      { passObj: event.target.checked },
      this.setFile,
    )

  unloadFile = () => this.setState(
    { file: null },
    this.setFile,
  )

  getTransformedFile = () => {
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

  setFile() {
    this.props.setFile(this.getTransformedFile());
  }

  render() {
    return (
      <fieldset id="load">
        <legend htmlFor="load">Load file</legend>

        <label htmlFor="file">Load from file:</label>
        <input
          type="file"
          onChange={this.onFileChange}
        />

        <label htmlFor="file">Load from file to Uint8Array:</label>
        <input
          type="file"
          onChange={this.onFileUintChange}
        />

        <form onSubmit={this.onURLChange}>
          <label htmlFor="url">Load from URL:</label>
          <input type="text" />
          <button type="submit">Apply</button>
        </form>

        <form onSubmit={this.onRequestChange}>
          <label htmlFor="url">Fetch and pass:</label>
          <input type="text" />
          <button type="submit">Apply</button>
        </form>

        <div>
          <button onClick={this.onUseImported}>Use imported file</button>
        </div>

        <div>
          <button onClick={this.onImportAndUnmount}>Import, unmount and mount</button>
        </div>

        <input id="passobj" type="checkbox" onChange={this.onPassObjChange} />
        <label htmlFor="passobj">Pass as an object (URLs and imports only)</label>

        <div>
          <button
            disabled={this.transformedFile === null}
            onClick={this.unloadFile}
          >
            Unload file
          </button>
        </div>
      </fieldset>
    );
  }
}

LoadingOptions.propTypes = {
  setFile: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
};
