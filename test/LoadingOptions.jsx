import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import samplePDF from './test.pdf';

import { isFile } from './shared/propTypes';

export default class LoadingOptions extends PureComponent {
  onFileChange = (event) => {
    const { setFile } = this.props;

    setFile(event.target.files[0]);
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

    fetch(url).then(response => response.blob()).then(setFile);
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

  unloadFile = () => {
    const { setFile } = this.props;

    setFile(null);
  }

  render() {
    const { file } = this.props;

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

LoadingOptions.propTypes = {
  file: isFile,
  setFile: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
};
