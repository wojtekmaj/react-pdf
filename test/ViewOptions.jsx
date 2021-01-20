import React from 'react';
import PropTypes from 'prop-types';

export default function ViewOptions({
  displayAll,
  pageHeight,
  pageScale,
  pageWidth,
  renderMode,
  rotate,
  setDisplayAll,
  setPageHeight,
  setPageScale,
  setPageWidth,
  setRenderMode,
  setRotate,
}) {
  function onRenderModeChange(event) {
    setRenderMode(event.target.value);
  }

  function onDisplayAllChange(event) {
    setDisplayAll(event.target.checked);
  }

  function onPageHeightChange(event) {
    event.preventDefault();

    const form = event.target;
    const { value: height } = form.pageHeight;

    if (!height) {
      return;
    }

    setPageHeight(parseInt(height, 10));
  }

  function onPageScaleChange(event) {
    event.preventDefault();

    const form = event.target;
    const { value: scale } = form.pageScale;

    if (!scale) {
      return;
    }

    setPageScale(parseFloat(scale));
  }

  function onPageWidthChange(event) {
    event.preventDefault();

    const form = event.target;
    const { value: width } = form.pageWidth;

    if (!width) {
      return;
    }

    setPageWidth(parseInt(width, 10));
  }

  function changeRotation(by) {
    setRotate((prevRotate) => (prevRotate + by + 360) % 360);
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
    setRotate(null);
  }

  function resetHeight() {
    setPageHeight(null);
  }

  function resetScale() {
    setPageScale(null);
  }

  function resetWidth() {
    setPageWidth(null);
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
          defaultValue={pageWidth}
          id="pageWidth"
          min={0}
          name="pageWidth"
          type="number"
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
          defaultValue={pageHeight}
          id="pageHeight"
          min={0}
          name="pageHeight"
          type="number"
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
          defaultValue={pageScale}
          id="pageScale"
          max={2}
          min={0}
          name="pageScale"
          step="0.01"
          type="range"
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
          onChange={onChangeRotate}
          step="90"
          style={{ width: '42px' }}
          type="number"
          value={rotate !== null ? rotate : ''}
        />
        &nbsp;
        <button
          onClick={rotateLeft}
          type="button"
        >
          Rotate left
        </button>
        &nbsp;
        <button
          onClick={rotateRight}
          type="button"
        >
          Rotate right
        </button>
        &nbsp;
        <button
          disabled={rotate === null}
          onClick={resetRotation}
          type="button"
        >
          Reset rotation
        </button>
      </div>

      <input
        checked={displayAll}
        id="displayAll"
        onChange={onDisplayAllChange}
        type="checkbox"
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
  setDisplayAll: PropTypes.func.isRequired,
  setPageHeight: PropTypes.func.isRequired,
  setPageScale: PropTypes.func.isRequired,
  setPageWidth: PropTypes.func.isRequired,
  setRenderMode: PropTypes.func.isRequired,
  setRotate: PropTypes.func.isRequired,
};
