import React from 'react';
import PropTypes from 'prop-types';

export default function LayerOptions({
  renderAnnotationLayer,
  renderInteractiveForms,
  renderTextLayer,
  setState,
}) {
  function onRenderAnnotationLayerChange(event) {
    setState({ renderAnnotationLayer: event.target.checked });
  }

  function onRenderInteractiveFormsChange(event) {
    setState({ renderInteractiveForms: event.target.checked });
  }

  function onRenderTextLayersChange(event) {
    setState({ renderTextLayer: event.target.checked });
  }

  return (
    <fieldset id="viewoptions">
      <legend htmlFor="viewoptions">
        Layer options
      </legend>

      <div>
        <input
          id="renderTextLayer"
          type="checkbox"
          checked={renderTextLayer}
          onChange={onRenderTextLayersChange}
        />
        <label htmlFor="renderTextLayer">
          Render text layer
        </label>
      </div>

      <div>
        <input
          id="renderAnnotationLayer"
          type="checkbox"
          checked={renderAnnotationLayer}
          onChange={onRenderAnnotationLayerChange}
        />
        <label htmlFor="renderAnnotationLayer">
          Render annotation layer
        </label>
      </div>

      <div>
        <input
          id="renderInteractiveForms"
          type="checkbox"
          checked={renderAnnotationLayer && renderInteractiveForms}
          onChange={onRenderInteractiveFormsChange}
          disabled={!renderAnnotationLayer}
        />
        <label htmlFor="renderInteractiveForms">
          Render interactive forms
        </label>
      </div>
    </fieldset>
  );
}

LayerOptions.propTypes = {
  renderAnnotationLayer: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  renderTextLayer: PropTypes.bool,
  setState: PropTypes.func.isRequired,
};
