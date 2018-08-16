import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ViewOptions extends PureComponent {
  onRenderAnnotationsChange = (event) => {
    const { setState } = this.props;

    setState({ renderAnnotations: event.target.checked });
  }

  onRenderInteractiveFormsChange = (event) => {
    const { setState } = this.props;

    setState({ renderInteractiveForms: event.target.checked });
  }

  onRenderModeChange = (event) => {
    const { setState } = this.props;

    setState({ renderMode: event.target.value });
  }

  onRenderTextLayersChange = (event) => {
    const { setState } = this.props;

    setState({ renderTextLayer: event.target.checked });
  }

  onDisplayAllChange = (event) => {
    const { setState } = this.props;

    setState({ displayAll: event.target.checked });
  }

  onPageHeightChange = (event) => {
    const { setState } = this.props;

    event.preventDefault();

    const form = event.target;
    const { value: height } = form.pageHeight;

    if (!height) {
      return;
    }

    setState({
      pageHeight: parseInt(height, 10),
    });
  }

  onPageScaleChange = (event) => {
    const { setState } = this.props;

    event.preventDefault();

    const form = event.target;
    const { value: scale } = form.pageScale;

    if (!scale) {
      return;
    }

    setState({
      pageScale: parseFloat(scale),
    });
  }

  onPageWidthChange = (event) => {
    const { setState } = this.props;

    event.preventDefault();

    const form = event.target;
    const { value: width } = form.pageWidth;

    if (!width) {
      return;
    }

    setState({
      pageWidth: parseInt(width, 10),
    });
  }

  rotateLeft = () => this.changeRotation(-90);

  rotateRight = () => this.changeRotation(90);

  changeRotation(by) {
    const { setState } = this.props;

    setState(prevState => ({ rotate: (prevState.rotate + by + 360) % 360 }));
  }

  resetRotation = () => {
    const { setState } = this.props;

    setState({ rotate: null });
  }

  resetHeight = () => {
    const { setState } = this.props;

    setState({ pageHeight: null });
  }

  resetWidth = () => {
    const { setState } = this.props;

    setState({ pageWidth: null });
  }

  render() {
    const {
      displayAll,
      pageHeight,
      pageScale,
      pageWidth,
      renderAnnotations,
      renderInteractiveForms,
      renderMode,
      renderTextLayer,
      rotate,
    } = this.props;

    return (
      <fieldset id="viewoptions">
        <legend htmlFor="viewoptions">
          View options
        </legend>

        <form onSubmit={this.onPageWidthChange}>
          <label htmlFor="pageWidth">
            Page width:
          </label>
          &nbsp;
          <input
            type="number"
            min={0}
            id="pageWidth"
            name="pageWidth"
            defaultValue={pageWidth}
          />
          &nbsp;
          <button
            style={{ display: 'none' }}
            type="submit"
          >
            Set width
          </button>
          <button
            disabled={pageWidth === null}
            onClick={this.resetWidth}
            type="button"
          >
            Reset width
          </button>
        </form>

        <form onSubmit={this.onPageHeightChange}>
          <label htmlFor="pageHeight">
            Page height:
          </label>
          &nbsp;
          <input
            type="number"
            min={0}
            id="pageHeight"
            name="pageHeight"
            defaultValue={pageHeight}
          />
          &nbsp;
          <button
            style={{ display: 'none' }}
            type="submit"
          >
            Set height
          </button>
          <button
            disabled={pageHeight === null}
            onClick={this.resetHeight}
            type="button"
          >
            Reset height
          </button>
        </form>

        <form onSubmit={this.onPageScaleChange}>
          <label htmlFor="pageScale">
            Page scale:
          </label>
          &nbsp;
          <input
            type="number"
            min={0}
            id="pageScale"
            name="pageScale"
            step="0.01"
            defaultValue={pageScale}
          />
          &nbsp;
          <button
            style={{ display: 'none' }}
            type="submit"
          >
            Set scale
          </button>
          <button
            disabled={pageScale === null}
            onClick={this.resetScale}
            type="button"
          >
            Reset scale
          </button>
        </form>

        <label htmlFor="renderMode">
          Render mode:
        </label>
        <div>
          <input
            checked={!renderMode || (renderMode === 'canvas')}
            id="renderCanvas"
            name="renderMode"
            onChange={this.onRenderModeChange}
            type="radio"
            value="canvas"
          />
          <label htmlFor="renderCanvas">
            Canvas
          </label>
        </div>
        <div>
          <input
            checked={renderMode === 'svg'}
            id="renderSVG"
            name="renderMode"
            onChange={this.onRenderModeChange}
            type="radio"
            value="svg"
          />
          <label htmlFor="renderSVG">
            SVG
          </label>
        </div>

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

        <div>
          <label htmlFor="rotation">
            Rotation:
          </label>
          <input
            id="rotation"
            style={{ width: '42px' }}
            type="number"
            value={rotate !== null ? rotate : ''}
          />
          &nbsp;
          <button
            type="button"
            onClick={this.rotateLeft}
          >
            Rotate left
          </button>
          &nbsp;
          <button
            type="button"
            onClick={this.rotateRight}
          >
            Rotate right
          </button>
          &nbsp;
          <button
            type="button"
            disabled={rotate === null}
            onClick={this.resetRotation}
          >
            Reset rotation
          </button>
        </div>

        <input
          id="displayAll"
          type="checkbox"
          onChange={this.onDisplayAllChange}
          checked={displayAll}
        />
        <label htmlFor="displayAll">
          View all pages
        </label>
      </fieldset>
    );
  }
}

ViewOptions.propTypes = {
  displayAll: PropTypes.bool,
  pageHeight: PropTypes.number,
  pageScale: PropTypes.number,
  pageWidth: PropTypes.number,
  renderAnnotations: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  rotate: PropTypes.number,
  setState: PropTypes.func.isRequired,
};
