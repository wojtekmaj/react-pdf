import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ViewOptions extends PureComponent {
  onRenderModeChange = (event) => {
    const { setState } = this.props;

    setState({ renderMode: event.target.value });
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

  onChangeRotate = (event) => {
    const { rotate } = this.props;
    const newRotate = Number(event.target.value);
    this.changeRotation(newRotate - rotate);
  }

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

  resetScale = () => {
    const { setState } = this.props;

    setState({ pageScale: null });
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
      renderMode,
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
            type="range"
            min={0}
            max={2}
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
            checked={renderMode === 'none'}
            id="renderNone"
            name="renderMode"
            onChange={this.onRenderModeChange}
            type="radio"
            value="none"
          />
          <label htmlFor="renderNone">
            None
          </label>
        </div>
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
          <label htmlFor="rotation">
            Rotation:
          </label>
          <input
            id="rotation"
            style={{ width: '42px' }}
            type="number"
            onChange={this.onChangeRotate}
            value={rotate !== null ? rotate : ''}
            step="90"
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
  renderMode: PropTypes.oneOf(['canvas', 'none', 'svg']),
  rotate: PropTypes.number,
  setState: PropTypes.func.isRequired,
};
