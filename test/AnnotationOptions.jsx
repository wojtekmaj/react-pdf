import React from 'react';
import PropTypes from 'prop-types';

export default function AnnotationOptions({
  externalLinkTarget,
  setExternalLinkTarget,
}) {
  function onExternalLinkTargetChange(event) {
    const { value } = event.target;

    setExternalLinkTarget(value !== 'unset' ? value : null);
  }

  return (
    <fieldset id="annotationoptions">
      <legend htmlFor="annotationoptions">
        Annotation options
      </legend>

      <label htmlFor="externalLinkTarget">
        External link target
      </label>
      <div>
        <input
          checked={!externalLinkTarget || (externalLinkTarget === 'unset')}
          id="targetUnset"
          name="externalLinkTarget"
          onChange={onExternalLinkTargetChange}
          type="radio"
          value="unset"
        />
        <label htmlFor="targetUnset">
          Unset
        </label>
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
        <label htmlFor="targetSelf">
          _self
        </label>
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
        <label htmlFor="targetBlank">
          _blank
        </label>
      </div>
    </fieldset>
  );
}

AnnotationOptions.propTypes = {
  externalLinkTarget: PropTypes.oneOf(['_blank', '_self']),
  setExternalLinkTarget: PropTypes.func.isRequired,
};
