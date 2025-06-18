import { useId } from 'react';

import type { ExternalLinkTarget } from './shared/types.js';

type AnnotationOptionsProps = {
  externalLinkTarget: ExternalLinkTarget | undefined;
  setExternalLinkTarget: (value: ExternalLinkTarget | undefined) => void;
};

export default function AnnotationOptions({
  externalLinkTarget,
  setExternalLinkTarget,
}: AnnotationOptionsProps) {
  const targetUnsetId = useId();
  const targetSelfId = useId();
  const targetBlankId = useId();

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

      <label htmlFor={targetUnsetId}>External link target</label>
      <div>
        <input
          checked={externalLinkTarget === undefined}
          id={targetUnsetId}
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="undefined"
        />
        <label htmlFor={targetUnsetId}>Unset</label>
      </div>
      <div>
        <input
          checked={externalLinkTarget === '_self'}
          id={targetSelfId}
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="_self"
        />
        <label htmlFor={targetSelfId}>_self</label>
      </div>
      <div>
        <input
          checked={externalLinkTarget === '_blank'}
          id={targetBlankId}
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="_blank"
        />
        <label htmlFor={targetBlankId}>_blank</label>
      </div>
    </fieldset>
  );
}
