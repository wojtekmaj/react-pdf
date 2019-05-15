import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class LayerOptions extends PureComponent {
  onRenderAnnotationLayerChange = (event) => {
    const { setState } = this.props;

    setState({ renderAnnotationLayer: event.target.checked });
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
      renderAnnotationLayer,
      renderInteractiveForms,
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
            checked={renderTextLayer}
            onChange={this.onRenderTextLayersChange}
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
            onChange={this.onRenderAnnotationLayerChange}
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
            onChange={this.onRenderInteractiveFormsChange}
            disabled={!renderAnnotationLayer}
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
  renderAnnotationLayer: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  renderTextLayer: PropTypes.bool,
  setState: PropTypes.func.isRequired,
};
