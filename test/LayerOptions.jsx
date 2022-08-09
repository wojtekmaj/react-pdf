import React from 'react';
import PropTypes from 'prop-types';

export default function LayerOptions({
  renderAnnotationLayer,
  renderForms,
  renderTextLayer,
  setRenderAnnotationLayer,
  setRenderForms,
  setRenderTextLayer,
}) {
  function onRenderAnnotationLayerChange(event) {
    setRenderAnnotationLayer(event.target.checked);
  }

  function onRenderFormsChange(event) {
    setRenderForms(event.target.checked);
  }

  function onRenderTextLayersChange(event) {
    setRenderTextLayer(event.target.checked);
  }

  return (
    <fieldset id="layeroptions">
      <legend htmlFor="layeroptions">Layer options</legend>

      <div>
        <input
          checked={renderTextLayer}
          id="renderTextLayer"
          onChange={onRenderTextLayersChange}
          type="checkbox"
        />
        <label htmlFor="renderTextLayer">Render text layer</label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer}
          id="renderAnnotationLayer"
          onChange={onRenderAnnotationLayerChange}
          type="checkbox"
        />
        <label htmlFor="renderAnnotationLayer">Render annotation layer</label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer && renderForms}
          disabled={!renderAnnotationLayer}
          id="renderForms"
          onChange={onRenderFormsChange}
          type="checkbox"
        />
        <label htmlFor="renderForms">Render forms</label>
      </div>
    </fieldset>
  );
}

LayerOptions.propTypes = {
  renderAnnotationLayer: PropTypes.bool,
  renderForms: PropTypes.bool,
  renderTextLayer: PropTypes.bool,
  setRenderAnnotationLayer: PropTypes.func.isRequired,
  setRenderForms: PropTypes.func.isRequired,
  setRenderTextLayer: PropTypes.func.isRequired,
};
