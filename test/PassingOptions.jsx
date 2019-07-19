import React from 'react';
import PropTypes from 'prop-types';

import { isDataURI } from '../src/shared/utils';
import { isFile } from './shared/propTypes';

export default function PassingOptions({
  file,
  passMethod,
  setPassMethod,
}) {
  const sourceType = (() => {
    if (file === null) {
      return 'null';
    }

    if (typeof file === 'string') {
      if (isDataURI(file)) {
        return 'data URI';
      }

      return 'string';
    }

    if (typeof file === 'object') {
      return file.constructor.name;
    }

    return typeof file;
  })();

  function onPassMethodChange(event) {
    const nextPassMethod = event.target.value;

    setPassMethod(nextPassMethod === 'null' ? null : nextPassMethod);
  }

  return (
    <fieldset id="passingoptions">
      <legend htmlFor="passingoptions">
        Passing options
      </legend>

      <div>
        <input
          checked={passMethod === null}
          id="passNormal"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="null"
        />
        <label htmlFor="passNormal">
          Pass as is (
          {sourceType}
          )
        </label>
      </div>
      <div>
        <input
          checked={passMethod === 'object'}
          id="passObject"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="object"
        />
        <label htmlFor="passObject">
          Pass as a parameter object
        </label>
      </div>
      <div>
        <input
          checked={passMethod === 'string'}
          id="passString"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="string"
        />
        <label htmlFor="passString">
          Pass as a string/data URI
        </label>
      </div>
      <div>
        <input
          checked={passMethod === 'blob'}
          id="passBlob"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="blob"
        />
        <label htmlFor="passBlob">
          Pass as a File/Blob
        </label>
      </div>
    </fieldset>
  );
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

PassingOptions.propTypes = {
  file: isFile,
  passMethod: PropTypes.oneOf(['blob', 'normal', 'object', 'string']),
  setPassMethod: PropTypes.func.isRequired,
};
