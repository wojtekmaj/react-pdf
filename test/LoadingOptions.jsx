import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import samplePDF from './test.pdf';

export default class LoadingOptions extends PureComponent {
  onFileChange = (event) => {
    const { setFile } = this.props;

    setFile(event.target.files[0]);
  }

  onFileUintChange = (event) => {
    const { setFile } = this.props;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFile(reader.result);
    };

    reader.readAsArrayBuffer(event.target.files[0]);
  }

  onURLChange = (event) => {
    const { setFile } = this.props;

    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    setFile(url);
  }

  onRequestChange = (event) => {
    const { setFile } = this.props;

    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    fetch(url).then(response => response.blob()).then((blob) => {
      setFile(blob);
    });
  }

  onUseImported = () => {
    const { setFile } = this.props;

    setFile(samplePDF);
  }

  onImportAndUnmount = () => {
    const { setFile, setState } = this.props;

    setFile(samplePDF);

    setTimeout(() => setState({
      render: false,
    }), 20);

    setTimeout(() => setState({
      render: true,
    }), 1000);
  }

  onPassMethodChange = (event) => {
    const { setState } = this.props;

    const passMethod = event.target.value;

    setState({ passMethod });
  }

  unloadFile = () => {
    const { setFile } = this.props;

    setFile(null);
  }

  render() {
    const {
      file,
      passMethod,
    } = this.props;

    return (
      <fieldset id="load">
        <legend htmlFor="load">
          Load file
        </legend>

        <label htmlFor="file">
          Load from file:
        </label>
        <input
          id="file"
          type="file"
          onChange={this.onFileChange}
        />

        <label htmlFor="fileUint8Array">
          Load from file to Uint8Array:
        </label>
        <input
          id="fileUint8Array"
          type="file"
          onChange={this.onFileUintChange}
        />

        <form onSubmit={this.onURLChange}>
          <label htmlFor="url">
            Load from URL:
          </label>
          <input
            id="url"
            type="text"
          />
          <button type="submit">
            Apply
          </button>
        </form>

        <form onSubmit={this.onRequestChange}>
          <label htmlFor="fetchAndPass">
            Fetch and pass:
          </label>
          <input
            id="fetchAndPass"
            type="text"
          />
          <button type="submit">
            Apply
          </button>
        </form>

        <div>
          <button
            type="button"
            onClick={this.onUseImported}
          >
            Use imported file
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={this.onImportAndUnmount}
          >
            Import, unmount and mount
          </button>
        </div>

        <div>
          <input
            checked={passMethod === 'normal'}
            id="passNormal"
            name="passMethod"
            onChange={this.onPassMethodChange}
            type="radio"
            value="normal"
          />
          <label htmlFor="passNormal">
            Auto
          </label>
        </div>
        <div>
          <input
            checked={passMethod === 'object'}
            id="passObject"
            name="passMethod"
            onChange={this.onPassMethodChange}
            type="radio"
            value="object"
          />
          <label htmlFor="passObject">
            Pass as an object (URLs and imports only)
          </label>
        </div>
        <div>
          <input
            checked={passMethod === 'blob'}
            id="passBlob"
            name="passMethod"
            onChange={this.onPassMethodChange}
            type="radio"
            value="blob"
          />
          <label htmlFor="passBlob">
            Pass as a Blob (URLs and imports only)
          </label>
        </div>

        <div>
          <button
            type="button"
            disabled={file === null}
            onClick={this.unloadFile}
          >
            Unload file
          </button>
        </div>
      </fieldset>
    );
  }
}

const fileTypes = [
  PropTypes.string,
  PropTypes.instanceOf(ArrayBuffer),
  PropTypes.shape({
    data: PropTypes.object,
    httpHeaders: PropTypes.object,
    range: PropTypes.object,
    url: PropTypes.string,
    withCredentials: PropTypes.bool,
  }),
];
if (typeof File !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(File));
}
if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

LoadingOptions.propTypes = {
  file: PropTypes.oneOfType(fileTypes),
  passMethod: PropTypes.oneOf(['normal', 'object', 'blob']),
  setFile: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
};
