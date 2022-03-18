import React from 'react';
import PropTypes from 'prop-types';
import { AnnotationMode } from 'pdfjs-dist/legacy/build/pdf';

export default function LayerOptions({
  annotationMode,
  renderAnnotationLayer,
  renderForms,
  renderTextLayer,
  setAnnotationMode,
  setRenderAnnotationLayer,
  setRenderForms,
  setRenderTextLayer,
}) {
  function onAnnotationModeChange(event) {
    const { value } = event.target;

    setAnnotationMode(value.length > 0 ? Number(value) : null);
  }

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

      <div>
        <label htmlFor="annotationMode">Annotation mode</label>
        <select id="annotationMode" value={annotationMode ?? ''} onChange={onAnnotationModeChange}>
          <option value="">Unset</option>
          {Object.entries(AnnotationMode).map(([name, value]) => (
            <option key={name} value={value}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

LayerOptions.propTypes = {
  annotationMode: PropTypes.number,
  renderAnnotationLayer: PropTypes.bool,
  renderForms: PropTypes.bool,
  renderTextLayer: PropTypes.bool,
  setAnnotationMode: PropTypes.func.isRequired,
  setRenderAnnotationLayer: PropTypes.func.isRequired,
  setRenderForms: PropTypes.func.isRequired,
  setRenderTextLayer: PropTypes.func.isRequired,
};
