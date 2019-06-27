import React from 'react';
import PropTypes from 'prop-types';

export default function ViewOptions({
  displayAll,
  pageHeight,
  pageScale,
  pageWidth,
  renderMode,
  rotate,
  setState,
}) {
  function onRenderModeChange(event) {
    setState({ renderMode: event.target.value });
  }

  function onDisplayAllChange(event) {
    setState({ displayAll: event.target.checked });
  }

  function onPageHeightChange(event) {
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

  function onPageScaleChange(event) {
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

  function onPageWidthChange(event) {
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

  function changeRotation(by) {
    setState(prevState => ({ rotate: (prevState.rotate + by + 360) % 360 }));
  }

  function rotateLeft() {
    changeRotation(-90);
  }

  function rotateRight() {
    changeRotation(90);
  }

  function onChangeRotate(event) {
    const nextRotate = Number(event.target.value);
    changeRotation(nextRotate - rotate);
  }

  function resetRotation() {
    setState({ rotate: null });
  }

  function resetHeight() {
    setState({ pageHeight: null });
  }

  function resetScale() {
    setState({ pageScale: null });
  }

  function resetWidth() {
    setState({ pageWidth: null });
  }

  return (
    <fieldset id="viewoptions">
      <legend htmlFor="viewoptions">
        View options
      </legend>

      <form onSubmit={onPageWidthChange}>
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
          onClick={resetWidth}
          type="button"
        >
          Reset width
        </button>
      </form>

      <form onSubmit={onPageHeightChange}>
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
          onClick={resetHeight}
          type="button"
        >
          Reset height
        </button>
      </form>

      <form onSubmit={onPageScaleChange}>
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
          onClick={resetScale}
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
          onChange={onRenderModeChange}
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
          onChange={onRenderModeChange}
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
          onChange={onRenderModeChange}
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
          onChange={onChangeRotate}
          value={rotate !== null ? rotate : ''}
          step="90"
        />
        &nbsp;
        <button
          type="button"
          onClick={rotateLeft}
        >
          Rotate left
        </button>
        &nbsp;
        <button
          type="button"
          onClick={rotateRight}
        >
          Rotate right
        </button>
        &nbsp;
        <button
          type="button"
          disabled={rotate === null}
          onClick={resetRotation}
        >
          Reset rotation
        </button>
      </div>

      <input
        id="displayAll"
        type="checkbox"
        onChange={onDisplayAllChange}
        checked={displayAll}
      />
      <label htmlFor="displayAll">
        View all pages
      </label>
    </fieldset>
  );
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
