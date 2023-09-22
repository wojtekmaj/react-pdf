type LayerOptionsProps = {
  renderAnnotationLayer: boolean;
  renderForms: boolean;
  renderTextLayer: boolean;
  useCustomTextRenderer: boolean;
  setRenderAnnotationLayer: (value: boolean) => void;
  setRenderForms: (value: boolean) => void;
  setRenderTextLayer: (value: boolean) => void;
  setUseCustomTextRenderer: (value: boolean) => void;
};

export default function LayerOptions({
  renderAnnotationLayer,
  renderForms,
  renderTextLayer,
  useCustomTextRenderer,
  setRenderAnnotationLayer,
  setRenderForms,
  setRenderTextLayer,
  setUseCustomTextRenderer,
}: LayerOptionsProps) {
  function onRenderAnnotationLayerChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRenderAnnotationLayer(event.target.checked);
  }

  function onRenderFormsChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRenderForms(event.target.checked);
  }

  function onRenderTextLayersChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRenderTextLayer(event.target.checked);
  }

  function onUseCustomTextRendererChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUseCustomTextRenderer(event.target.checked);
  }

  return (
    <fieldset>
      <legend>Layer options</legend>

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
          checked={renderTextLayer ? useCustomTextRenderer : false}
          disabled={!renderTextLayer}
          id="useCustomTextRenderer"
          onChange={onUseCustomTextRendererChange}
          type="checkbox"
        />
        <label htmlFor="useCustomTextRenderer">Use custom text renderer</label>
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
          checked={renderAnnotationLayer ? renderForms : false}
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
