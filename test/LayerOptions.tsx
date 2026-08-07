import { useId } from 'react';

import type { AnnotationMode } from 'react-pdf';

type LayerOptionsProps = {
  annotationMode?: keyof typeof AnnotationMode;
  renderAnnotationLayer: boolean;
  renderTextLayer: boolean;
  useCustomTextRenderer: boolean;
  setAnnotationMode: (value: keyof typeof AnnotationMode | undefined) => void;
  setRenderAnnotationLayer: (value: boolean) => void;
  setRenderTextLayer: (value: boolean) => void;
  setUseCustomTextRenderer: (value: boolean) => void;
};

export default function LayerOptions({
  annotationMode,
  renderAnnotationLayer,
  renderTextLayer,
  useCustomTextRenderer,
  setAnnotationMode,
  setRenderAnnotationLayer,
  setRenderTextLayer,
  setUseCustomTextRenderer,
}: LayerOptionsProps) {
  const annotationModeId = useId();
  const renderTextLayerId = useId();
  const useCustomTextRendererId = useId();
  const renderAnnotationLayerId = useId();

  function onAnnotationModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = event.target;

    setAnnotationMode(value ? (value as keyof typeof AnnotationMode) : undefined);
  }

  function onRenderAnnotationLayerChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRenderAnnotationLayer(event.target.checked);
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

      <label htmlFor={annotationModeId}>Annotation mode:</label>
      <select id={annotationModeId} onChange={onAnnotationModeChange} value={annotationMode ?? ''}>
        <option value="">Default</option>
        <option value="DISABLE">DISABLE</option>
        <option value="ENABLE">ENABLE</option>
        <option value="ENABLE_FORMS">ENABLE_FORMS</option>
        <option value="ENABLE_STORAGE">ENABLE_STORAGE</option>
      </select>

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
    </fieldset>
  );
}
