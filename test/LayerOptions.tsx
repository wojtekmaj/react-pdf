import { useId } from 'react';

import type { AnnotationMode } from 'react-pdf';

type LayerOptionsProps = {
  annotationMode?: keyof typeof AnnotationMode;
  renderAnnotationLayer: boolean;
  renderForms: boolean;
  renderTextLayer: boolean;
  useCustomTextRenderer: boolean;
  setAnnotationMode: (value: keyof typeof AnnotationMode | undefined) => void;
  setRenderAnnotationLayer: (value: boolean) => void;
  setRenderForms: (value: boolean) => void;
  setRenderTextLayer: (value: boolean) => void;
  setUseCustomTextRenderer: (value: boolean) => void;
};

export default function LayerOptions({
  annotationMode,
  renderAnnotationLayer,
  renderForms,
  renderTextLayer,
  useCustomTextRenderer,
  setAnnotationMode,
  setRenderAnnotationLayer,
  setRenderForms,
  setRenderTextLayer,
  setUseCustomTextRenderer,
}: LayerOptionsProps) {
  const annotationModeId = useId();
  const renderTextLayerId = useId();
  const useCustomTextRendererId = useId();
  const renderAnnotationLayerId = useId();
  const renderFormsId = useId();

  function onAnnotationModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    setAnnotationMode(value as keyof typeof AnnotationMode);
  }

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

      <label htmlFor={annotationModeId}>Annotation mode:</label>
      <div>
        <input
          checked={annotationMode === 'DISABLE'}
          id={annotationModeId}
          onChange={onAnnotationModeChange}
          type="radio"
          value="DISABLE"
        />
        <label htmlFor={annotationModeId}>DISABLE</label>
      </div>
      <div>
        <input
          checked={annotationMode === 'ENABLE'}
          id={annotationModeId}
          onChange={onAnnotationModeChange}
          type="radio"
          value="ENABLE"
        />
        <label htmlFor={annotationModeId}>ENABLE</label>
      </div>
      <div>
        <input
          checked={annotationMode === 'ENABLE_FORMS'}
          id={annotationModeId}
          onChange={onAnnotationModeChange}
          type="radio"
          value="ENABLE_FORMS"
        />
        <label htmlFor={annotationModeId}>ENABLE_FORMS</label>
      </div>
      <div>
        <input
          checked={annotationMode === 'ENABLE_STORAGE'}
          id={annotationModeId}
          onChange={onAnnotationModeChange}
          type="radio"
          value="EDIT"
        />
        <label htmlFor={annotationModeId}>EDIT</label>
      </div>

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
