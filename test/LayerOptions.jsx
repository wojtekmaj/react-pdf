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
    <fieldset id="layeroptions">
      <legend htmlFor="layeroptions">
        Layer options
      </legend>

      <div>
        <input
          checked={renderTextLayer}
          id="renderTextLayer"
          onChange={onRenderTextLayersChange}
          type="checkbox"
        />
        <label htmlFor="renderTextLayer">
          Render text layer
        </label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer}
          id="renderAnnotationLayer"
          onChange={onRenderAnnotationLayerChange}
          type="checkbox"
        />
        <label htmlFor="renderAnnotationLayer">
          Render annotation layer
        </label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer && renderInteractiveForms}
          disabled={!renderAnnotationLayer}
          id="renderInteractiveForms"
          onChange={onRenderInteractiveFormsChange}
          type="checkbox"
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
