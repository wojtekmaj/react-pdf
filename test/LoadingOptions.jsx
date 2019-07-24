import React from 'react';
import PropTypes from 'prop-types';

import samplePDF from './test.pdf';

import { isFile } from './shared/propTypes';

export default function LoadingOptions({
  file,
  setFile,
  setState,
}) {
  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  function onURLChange(event) {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    setFile(url);
  }

  function onRequestChange(event) {
    event.preventDefault();

    const url = event.target.querySelector('input').value;

    if (!url) {
      return;
    }

    fetch(url).then(response => response.blob()).then(setFile);
  }

  function onUseImported() {
    setFile(samplePDF);
  }

  function onImportAndUnmount() {
    setFile(samplePDF);

    setTimeout(() => setState({
      render: false,
    }), 20);

    setTimeout(() => setState({
      render: true,
    }), 1000);
  }

  function unloadFile() {
    setFile(null);
  }

  return (
    <fieldset id="loadingoptions">
      <legend htmlFor="loadingoptions">
        Load file
      </legend>

      <label htmlFor="file">
        Load from file:
      </label>
      <input
        id="file"
        onChange={onFileChange}
        type="file"
      />

      <form onSubmit={onURLChange}>
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

      <form onSubmit={onRequestChange}>
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
          onClick={onUseImported}
          type="button"
        >
          Use imported file
        </button>
      </div>

      <div>
        <button
          onClick={onImportAndUnmount}
          type="button"
        >
          Import, unmount and mount
        </button>
      </div>

      <div>
        <button
          disabled={file === null}
          onClick={unloadFile}
          type="button"
        >
          Unload file
        </button>
      </div>
    </fieldset>
  );
}

LoadingOptions.propTypes = {
  file: isFile,
  setFile: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
};
