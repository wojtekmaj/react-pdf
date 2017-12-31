import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ViewOptions extends Component {
  onRenderAnnotationsChange = event =>
    this.props.setState({ renderAnnotations: event.target.checked })

  onRenderModeChange = event =>
    this.props.setState({ renderMode: event.target.value })

  onRenderTextLayersChange = event =>
    this.props.setState({ renderTextLayer: event.target.checked })

  onDisplayAllChange = event =>
    this.props.setState({ displayAll: event.target.checked })

  onPageWidthChange = (event) => {
    event.preventDefault();

    const form = event.target;

    const width = form.pageWidth.value;

    if (!width) {
      return;
    }

    this.props.setState({
      pageWidth: parseInt(width, 10),
    });
  }

  rotateLeft = () => this.changeRotation(-90);

  rotateRight = () => this.changeRotation(90);

  changeRotation(by) {
    this.props.setState(prevState => ({ rotate: (prevState.rotate + by + 360) % 360 }));
  }

  resetRotation = () => this.props.setState({ rotate: null })

  resetWidth = () => this.props.setState({ pageWidth: null })

  render() {
    const {
      displayAll,
      pageWidth,
      renderAnnotations,
      renderMode,
      renderTextLayer,
      rotate,
    } = this.props;

    return (
      <fieldset id="viewoptions">
        <legend htmlFor="viewoptions">View options</legend>

        <form onSubmit={this.onPageWidthChange}>
          <label htmlFor="pageWidth">Page width:</label>&nbsp;
          <input
            type="number"
            min={0}
            id="pageWidth"
            name="pageWidth"
            defaultValue={pageWidth}
          />&nbsp;
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

        <label htmlFor="renderMode">Render mode:</label>
        <div>
          <input
            checked={!renderMode || (renderMode === 'canvas')}
            id="renderCanvas"
            name="renderMode"
            onChange={this.onRenderModeChange}
            type="radio"
            value="canvas"
          />
          <label htmlFor="renderCanvas">Canvas</label>
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
          <label htmlFor="renderSVG">SVG</label>
        </div>

        <div>
          <input
            id="renderTextLayer"
            type="checkbox"
            checked={renderMode === 'canvas' && renderTextLayer}
            disabled={renderMode !== 'canvas'}
            onChange={this.onRenderTextLayersChange}
          />
          <label htmlFor="renderTextLayer">Render text layers</label>
        </div>

        <div>
          <input
            id="renderAnnotations"
            type="checkbox"
            checked={renderAnnotations}
            onChange={this.onRenderAnnotationsChange}
          />
          <label htmlFor="renderAnnotations">Render annotations</label>
        </div>

        <div>
          <label htmlFor="rotation">Rotation:</label>
          <input
            id="rotation"
            style={{ width: '42px' }}
            type="number"
            value={rotate !== null ? rotate : ''}
          />&nbsp;
          <button onClick={this.rotateLeft}>Rotate left</button>&nbsp;
          <button onClick={this.rotateRight}>Rotate right</button>&nbsp;
          <button
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
        <label htmlFor="displayAll">View all pages</label>
      </fieldset>
    );
  }
}

ViewOptions.propTypes = {
  displayAll: PropTypes.bool,
  pageWidth: PropTypes.number,
  renderAnnotations: PropTypes.bool,
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  renderTextLayer: PropTypes.bool,
  rotate: PropTypes.number,
  setState: PropTypes.func.isRequired,
};
