import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class LayerOptions extends PureComponent {
  onRenderAnnotationsChange = (event) => {
    const { setState } = this.props;

    setState({ renderAnnotations: event.target.checked });
  }

  onRenderInteractiveFormsChange = (event) => {
    const { setState } = this.props;

    setState({ renderInteractiveForms: event.target.checked });
  }

  onRenderTextLayersChange = (event) => {
    const { setState } = this.props;

    setState({ renderTextLayer: event.target.checked });
  }

  render() {
    const {
      renderAnnotations,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
    } = this.props;

    return (
      <fieldset id="viewoptions">
        <legend htmlFor="viewoptions">
          Layer options
        </legend>

        <div>
          <input
            id="renderTextLayer"
            type="checkbox"
            checked={renderMode === 'canvas' && renderTextLayer}
            disabled={renderMode !== 'canvas'}
            onChange={this.onRenderTextLayersChange}
          />
          <label htmlFor="renderTextLayer">
            Render text layers
          </label>
        </div>

        <div>
          <input
            id="renderAnnotations"
            type="checkbox"
            checked={renderAnnotations}
            onChange={this.onRenderAnnotationsChange}
          />
          <label htmlFor="renderAnnotations">
            Render annotations
          </label>
        </div>

        <div>
          <input
            id="renderInteractiveForms"
            type="checkbox"
            checked={renderInteractiveForms}
            onChange={this.onRenderInteractiveFormsChange}
          />
          <label htmlFor="renderInteractiveForms">
            Render interactive forms
          </label>
        </div>
      </fieldset>
    );
  }
}

LayerOptions.propTypes = {
  renderAnnotations: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  setState: PropTypes.func.isRequired,
};
