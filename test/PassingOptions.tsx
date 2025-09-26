import { isDataURI } from './shared/utils.js';
import { useId } from 'react';

import type { File, PassMethod } from './shared/types.js';

type PassingOptionsProps = {
  file: File | null;
  passMethod: PassMethod | undefined;
  setPassMethod: (value: PassMethod | undefined) => void;
};

export default function PassingOptions({ file, passMethod, setPassMethod }: PassingOptionsProps) {
  const passNormalId = useId();
  const passObjectId = useId();
  const passStringId = useId();
  const passBlobId = useId();

  const sourceType = (() => {
    if (file === null) {
      return 'null';
    }

    if (typeof file === 'string') {
      if (isDataURI(file)) {
        return 'data URI';
      }

      return 'string';
    }

    if (typeof file === 'object') {
      return file.constructor.name;
    }

    return typeof file;
  })();

  function onPassMethodChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextPassMethod = event.target.value;

    if (nextPassMethod === 'undefined') {
      setPassMethod(undefined);
    } else {
      setPassMethod(nextPassMethod as PassMethod);
    }
  }

  return (
    <fieldset>
      <legend>Passing options</legend>

      <div>
        <input
          checked={passMethod === undefined}
          id={passNormalId}
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="undefined"
        />
        <label htmlFor={passNormalId}>Pass as is ({sourceType})</label>
      </div>
      <div>
        <input
          checked={passMethod === 'object'}
          id={passObjectId}
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="object"
        />
        <label htmlFor={passObjectId}>Pass as a parameter object</label>
      </div>
      <div>
        <input
          checked={passMethod === 'string'}
          id={passStringId}
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="string"
        />
        <label htmlFor={passStringId}>Pass as a string/data URI</label>
      </div>
    </fieldset>
  );
}
