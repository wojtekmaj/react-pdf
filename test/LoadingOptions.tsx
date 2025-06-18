import { useId, useRef } from 'react';

import samplePDF from './test.pdf';

import type { File } from './shared/types.js';

type LoadingOptionsProps = {
  file: File | null;
  setFile: (value: File | null) => void;
  setRender: (value: boolean) => void;
};

export default function LoadingOptions({ file, setFile, setRender }: LoadingOptionsProps) {
  const url = useRef<HTMLInputElement>(null);
  const fetchAndPass = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const urlId = useId();
  const fetchAndPassId = useId();

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    if (files?.[0]) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
  }

  function onURLChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = url.current;
    const { value: nextUrl } = input as HTMLInputElement;

    setFile(nextUrl);
  }

  function onRequestChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = fetchAndPass.current;
    const { value: nextFetchAndPass } = input as HTMLInputElement;

    fetch(nextFetchAndPass)
      .then((response) => response.blob())
      .then(setFile);
  }

  function onUseImported() {
    setFile(samplePDF);
  }

  function onImportAndUnmount() {
    setFile(samplePDF);

    setTimeout(() => setRender(false), 20);

    setTimeout(() => setRender(true), 1000);
  }

  function unloadFile() {
    setFile(null);
  }

  return (
    <fieldset>
      <legend>Load file</legend>

      <label htmlFor={fileId}>Load from file:</label>
      <input id={fileId} onChange={onFileChange} type="file" />

      <form onSubmit={onURLChange}>
        <label htmlFor={urlId}>Load from URL:</label>
        <input id={urlId} type="text" />
        <button type="submit">Apply</button>
      </form>

      <form onSubmit={onRequestChange}>
        <label htmlFor={fetchAndPassId}>Fetch and pass:</label>
        <input id={fetchAndPassId} type="text" />
        <button type="submit">Apply</button>
      </form>

      <div>
        <button onClick={onUseImported} type="button">
          Use imported file
        </button>
      </div>

      <div>
        <button onClick={onImportAndUnmount} type="button">
          Import, unmount and mount
        </button>
      </div>

      <div>
        <button disabled={file === null} onClick={unloadFile} type="button">
          Unload file
        </button>
      </div>
    </fieldset>
  );
}
