import { useId } from 'react';

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
  const renderTextLayerId = useId();
  const useCustomTextRendererId = useId();
  const renderAnnotationLayerId = useId();
  const renderFormsId = useId();

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
          id={renderTextLayerId}
          onChange={onRenderTextLayersChange}
          type="checkbox"
        />
        <label htmlFor={renderTextLayerId}>Render text layer</label>
      </div>

      <div>
        <input
          checked={renderTextLayer ? useCustomTextRenderer : false}
          disabled={!renderTextLayer}
          id={useCustomTextRendererId}
          onChange={onUseCustomTextRendererChange}
          type="checkbox"
        />
        <label htmlFor={useCustomTextRendererId}>Use custom text renderer</label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer}
          id={renderAnnotationLayerId}
          onChange={onRenderAnnotationLayerChange}
          type="checkbox"
        />
        <label htmlFor={renderAnnotationLayerId}>Render annotation layer</label>
      </div>

      <div>
        <input
          checked={renderAnnotationLayer ? renderForms : false}
          disabled={!renderAnnotationLayer}
          id={renderFormsId}
          onChange={onRenderFormsChange}
          type="checkbox"
        />
        <label htmlFor={renderFormsId}>Render forms</label>
      </div>
    </fieldset>
  );
}
