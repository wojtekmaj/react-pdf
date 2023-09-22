import type { ExternalLinkTarget } from './shared/types.js';

type AnnotationOptionsProps = {
  externalLinkTarget: ExternalLinkTarget | undefined;
  setExternalLinkTarget: (value: ExternalLinkTarget | undefined) => void;
};

export default function AnnotationOptions({
  externalLinkTarget,
  setExternalLinkTarget,
}: AnnotationOptionsProps) {
  function onExternalLinkTargetChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    if (value === 'undefined') {
      setExternalLinkTarget(undefined);
    } else {
      setExternalLinkTarget(value as '_blank' | '_self');
    }
  }

  return (
    <fieldset>
      <legend>Annotation options</legend>

      <label htmlFor="externalLinkTarget">External link target</label>
      <div>
        <input
          checked={externalLinkTarget === undefined}
          id="targetUnset"
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="undefined"
        />
        <label htmlFor="targetUnset">Unset</label>
      </div>
      <div>
        <input
          checked={externalLinkTarget === '_self'}
          id="targetSelf"
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="_self"
        />
        <label htmlFor="targetSelf">_self</label>
      </div>
      <div>
        <input
          checked={externalLinkTarget === '_blank'}
          id="targetBlank"
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="_blank"
        />
        <label htmlFor="targetBlank">_blank</label>
      </div>
    </fieldset>
  );
}
