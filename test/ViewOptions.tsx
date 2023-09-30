import { useRef } from 'react';

import type { RenderMode } from './shared/types.js';

type ViewOptionsProps = {
  canvasBackground?: string;
  devicePixelRatio?: number;
  displayAll: boolean;
  pageHeight?: number;
  pageScale?: number;
  pageWidth?: number;
  renderMode?: RenderMode;
  rotate?: number;
  setCanvasBackground: (value: string | undefined) => void;
  setDevicePixelRatio: (value: number | undefined) => void;
  setDisplayAll: (value: boolean) => void;
  setPageHeight: (value: number | undefined) => void;
  setPageScale: (value: number | undefined) => void;
  setPageWidth: (value: number | undefined) => void;
  setRenderMode: (value: RenderMode | undefined) => void;
  setRotate: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export default function ViewOptions({
  canvasBackground,
  devicePixelRatio,
  displayAll,
  pageHeight,
  pageScale,
  pageWidth,
  renderMode,
  rotate,
  setCanvasBackground,
  setDevicePixelRatio,
  setDisplayAll,
  setPageHeight,
  setPageScale,
  setPageWidth,
  setRenderMode,
  setRotate,
}: ViewOptionsProps) {
  const devicePixelRatioInput = useRef<HTMLInputElement>(null);
  const pageHeightInput = useRef<HTMLInputElement>(null);
  const pageWidthInput = useRef<HTMLInputElement>(null);
  const pageScaleInput = useRef<HTMLInputElement>(null);

  function onCanvasBackgroundChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCanvasBackground(event.target.value);
  }

  function onDevicePixelRatioChange(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = devicePixelRatioInput.current;
    const { valueAsNumber: devicePixelRatio } = input as HTMLInputElement;

    setDevicePixelRatio(devicePixelRatio);
  }

  function onDisplayAllChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDisplayAll(event.target.checked);
  }

  function onPageHeightChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = pageHeightInput.current;
    const { valueAsNumber: nextHeight } = input as HTMLInputElement;

    setPageHeight(nextHeight);
  }

  function onPageScaleChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = pageScaleInput.current;
    const { valueAsNumber: nextScale } = input as HTMLInputElement;

    setPageScale(nextScale);
  }

  function onPageWidthChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = pageWidthInput.current;
    const { valueAsNumber: nextWidth } = input as HTMLInputElement;

    setPageWidth(nextWidth);
  }

  function onRenderModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setRenderMode(value as RenderMode);
  }

  function changeRotation(by: number) {
    setRotate((prevRotate) => ((prevRotate || 0) + by + 360) % 360);
  }

  function rotateLeft() {
    changeRotation(-90);
  }

  function rotateRight() {
    changeRotation(90);
  }

  function onChangeRotate(event: React.ChangeEvent<HTMLInputElement>) {
    const { valueAsNumber: nextRotate } = event.target;

    changeRotation(nextRotate - (rotate || 0));
  }

  function resetRotation() {
    setRotate(undefined);
  }

  function resetHeight() {
    setPageHeight(undefined);
  }

  function resetScale() {
    setPageScale(undefined);
  }

  function resetWidth() {
    setPageWidth(undefined);
  }

  function resetDevicePixelRatio() {
    setDevicePixelRatio(undefined);
  }

  return (
    <fieldset>
      <legend>View options</legend>

      <label htmlFor="canvasBackground">Canvas background:</label>
      <input
        defaultValue={canvasBackground || '#ffffff'}
        id="canvasBackground"
        onChange={onCanvasBackgroundChange}
        type="color"
      />

      <form onSubmit={onPageWidthChange}>
        <label htmlFor="pageWidth">Page width:</label>
        &nbsp;
        <input
          defaultValue={pageWidth ? `${pageWidth}` : ''}
          id="pageWidth"
          min={0}
          name="pageWidth"
          ref={pageWidthInput}
          type="number"
        />
        &nbsp;
        <button style={{ display: 'none' }} type="submit">
          Set width
        </button>
        <button disabled={pageWidth === null} onClick={resetWidth} type="button">
          Reset width
        </button>
      </form>

      <form onSubmit={onPageHeightChange}>
        <label htmlFor="pageHeight">Page height:</label>
        &nbsp;
        <input
          defaultValue={pageHeight ? `${pageHeight}` : ''}
          id="pageHeight"
          min={0}
          name="pageHeight"
          ref={pageHeightInput}
          type="number"
        />
        &nbsp;
        <button style={{ display: 'none' }} type="submit">
          Set height
        </button>
        <button disabled={pageHeight === null} onClick={resetHeight} type="button">
          Reset height
        </button>
      </form>

      <form onSubmit={onPageScaleChange}>
        <label htmlFor="pageScale">Page scale:</label>
        &nbsp;
        <input
          defaultValue={pageScale ? `${pageScale}` : ''}
          id="pageScale"
          max={2}
          min={0}
          name="pageScale"
          ref={pageScaleInput}
          step="0.01"
          type="range"
        />
        &nbsp;
        <button style={{ display: 'none' }} type="submit">
          Set scale
        </button>
        <button disabled={pageScale === null} onClick={resetScale} type="button">
          Reset scale
        </button>
      </form>

      <form onSubmit={onDevicePixelRatioChange}>
        <label htmlFor="devicePixelRatio">Device pixel ratio:</label>
        &nbsp;
        <input
          defaultValue={devicePixelRatio ? `${devicePixelRatio}` : ''}
          id="devicePixelRatio"
          max={3}
          min={1}
          name="devicePixelRatio"
          ref={devicePixelRatioInput}
          step={1}
          type="number"
        />
        &nbsp;
        <button style={{ display: 'none' }} type="submit">
          Set device pixel ratio
        </button>
        <button disabled={devicePixelRatio === null} onClick={resetDevicePixelRatio} type="button">
          Reset device pixel ratio
        </button>
      </form>

      <label htmlFor="renderMode">Render mode:</label>
      <div>
        <input
          checked={!renderMode || renderMode === 'canvas'}
          id="renderCanvas"
          name="renderMode"
          onChange={onRenderModeChange}
          type="radio"
          value="canvas"
        />
        <label htmlFor="renderCanvas">Canvas</label>
      </div>
      <div>
        <input
          checked={renderMode === 'custom'}
          id="renderCustom"
          name="renderMode"
          onChange={onRenderModeChange}
          type="radio"
          value="custom"
        />
        <label htmlFor="renderCustom">Custom</label>
      </div>
      <div>
        <input
          checked={renderMode === 'none'}
          id="renderNone"
          name="renderMode"
          onChange={onRenderModeChange}
          type="radio"
          value="none"
        />
        <label htmlFor="renderNone">None</label>
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
        <label htmlFor="renderSVG">SVG</label>
      </div>

      <div>
        <label htmlFor="rotation">Rotation:</label>
        <input
          id="rotation"
          onChange={onChangeRotate}
          step="90"
          style={{ width: '42px' }}
          type="number"
          value={rotate !== null ? rotate : ''}
        />
        &nbsp;
        <button onClick={rotateLeft} type="button">
          Rotate left
        </button>
        &nbsp;
        <button onClick={rotateRight} type="button">
          Rotate right
        </button>
        &nbsp;
        <button disabled={rotate === null} onClick={resetRotation} type="button">
          Reset rotation
        </button>
      </div>

      <input checked={displayAll} id="displayAll" onChange={onDisplayAllChange} type="checkbox" />
      <label htmlFor="displayAll">View all pages</label>
    </fieldset>
  );
}
