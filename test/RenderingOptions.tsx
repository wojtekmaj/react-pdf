import { useId } from 'react';

type RenderingOptionsProps = {
  setSuspense: (value: boolean) => void;
  suspense: boolean;
};

export default function RenderingOptions({ setSuspense, suspense }: RenderingOptionsProps) {
  const suspenseId = useId();
  const placeholdersId = useId();

  function changeSuspense(event: React.ChangeEvent<HTMLInputElement>) {
    setSuspense(event.target.value === 'suspense');
  }

  return (
    <fieldset>
      <legend>Rendering options</legend>
      <div>
        <input
          checked={suspense}
          id={suspenseId}
          name="suspense"
          onChange={changeSuspense}
          type="radio"
          value="suspense"
        />
        <label htmlFor={suspenseId}>Suspense and Error Boundary</label>
      </div>
      <div>
        <input
          checked={!suspense}
          id={placeholdersId}
          name="suspense"
          onChange={changeSuspense}
          type="radio"
          value="placeholders"
        />
        <label htmlFor={placeholdersId}>Loading and error placeholders</label>
      </div>
    </fieldset>
  );
}
