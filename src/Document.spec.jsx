import React, { createRef } from 'react';
import { fireEvent, getByTestId, render } from '@testing-library/react';

import { pdfjs } from './entry.jest';

import Document from './Document';
import DocumentContext from './DocumentContext';

import { makeAsyncCallback, loadPDF, muteConsole, restoreConsole } from '../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');

const OK = Symbol('OK');

// eslint-disable-next-line react/prop-types
function ChildInternal({ renderMode, rotate }) {
  return <div data-testid="child" data-rendermode={renderMode} data-rotate={rotate} />;
}

function Child(props) {
  return (
    <DocumentContext.Consumer>
      {(context) => <ChildInternal {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}

function waitForAsync() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('Document', () => {
  // Object with basic loaded PDF information that shall match after successful loading
  const desiredLoadedPdf = {};
  const desiredLoadedPdf2 = {};

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;
    desiredLoadedPdf._pdfInfo = pdf._pdfInfo;

    const pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;
    desiredLoadedPdf2._pdfInfo = pdf2._pdfInfo;
  });

  describe('loading', () => {
    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(
        <Document
          file={pdfFile.dataURI}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly (param object)', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(
        <Document
          file={{ url: pdfFile.dataURI }}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via ArrayBuffer properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(
        <Document
          file={pdfFile.arrayBuffer}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via Blob properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(
        <Document
          file={pdfFile.blob}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via File properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('fails to load a file and calls onSourceError given invalid file source', async () => {
      const { func: onSourceError, promise: onSourceErrorPromise } = makeAsyncCallback();

      muteConsole();

      render(<Document file={() => null} onSourceError={onSourceError} />);

      expect.assertions(1);

      const error = await onSourceErrorPromise;

      expect(error).toMatchObject(expect.any(Error));

      restoreConsole();
    });

    it('replaces a file properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = render(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />,
      );

      expect.assertions(4);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);

      const { func: onSourceSuccess2, promise: onSourceSuccessPromise2 } = makeAsyncCallback(OK);
      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(
        <Document
          file={pdfFile2.file}
          onLoadSuccess={onLoadSuccess2}
          onSourceSuccess={onSourceSuccess2}
        />,
      );

      await expect(onSourceSuccessPromise2).resolves.toBe(OK);
      await expect(onLoadSuccessPromise2).resolves.toMatchObject(desiredLoadedPdf2);
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', () => {
      const className = 'testClassName';

      const { container } = render(<Document className={className} />);

      const wrapper = container.querySelector('.react-pdf__Document');

      expect(wrapper).toHaveClass(className);
    });

    it('passes container element to inputRef properly', () => {
      const inputRef = jest.fn();

      render(<Document inputRef={inputRef} />);

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it('renders "No PDF file specified." when given nothing', () => {
      const { container } = render(<Document />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('No PDF file specified.');
    });

    it('renders custom no data message when given nothing and noData prop is given', () => {
      const { container } = render(<Document noData="Nothing here" />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');
    });

    it('renders custom no data message when given nothing and noData prop is given as a function', () => {
      const { container } = render(<Document noData={() => 'Nothing here'} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');
    });

    it('renders "Loading PDF…" when loading a file', async () => {
      const { container } = render(<Document file={pdfFile.file} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading PDF…');
    });

    it('renders custom loading message when loading a file and loading prop is given', async () => {
      const { container } = render(<Document file={pdfFile.file} loading="Loading" />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('renders custom loading message when loading a file and loading prop is given as a function', async () => {
      const { container } = render(<Document file={pdfFile.file} loading={() => 'Loading'} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('renders "Failed to load PDF file." when failed to load a document', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = render(<Document file={failingPdf} onLoadError={onLoadError} />);

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Failed to load PDF file.');

      restoreConsole();
    });

    it('renders custom error message when failed to load a document and error prop is given', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = render(
        <Document error="Error" file={failingPdf} onLoadError={onLoadError} />,
      );

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Error');

      restoreConsole();
    });

    it('renders custom error message when failed to load a document and error prop is given as a function', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = render(
        <Document error="Error" file={failingPdf} onLoadError={onLoadError} />,
      );

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Error');

      restoreConsole();
    });

    it('passes renderMode prop to its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="svg"
        >
          <Child />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = getByTestId(container, 'child');
      expect(child.dataset.rendermode).toBe('svg');
    });

    it('passes rotate prop to its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Document file={pdfFile.file} loading="Loading" onLoadSuccess={onLoadSuccess} rotate={90}>
          <Child />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = getByTestId(container, 'child');
      expect(child.dataset.rotate).toBe('90');
    });

    it('does not overwrite renderMode prop in its children when given renderMode prop to both Document and its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="svg"
        >
          <Child renderMode="canvas" />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = getByTestId(container, 'child');
      expect(child.dataset.rendermode).toBe('canvas');
    });

    it('does not overwrite rotate prop in its children when given rotate prop to both Document and its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Document file={pdfFile.file} loading="Loading" onLoadSuccess={onLoadSuccess} rotate={90}>
          <Child rotate={180} />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = getByTestId(container, 'child');
      expect(child.dataset.rotate).toBe('180');
    });
  });

  describe('viewer', () => {
    it('calls onItemClick if defined', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const onItemClick = jest.fn();
      const instance = createRef();

      render(
        <Document
          file={pdfFile.file}
          onItemClick={onItemClick}
          onLoadSuccess={onLoadSuccess}
          ref={instance}
        />,
      );

      expect.assertions(2);

      await onLoadSuccessPromise;

      const dest = [];
      const pageIndex = 5;
      const pageNumber = 6;

      // Simulate clicking on an outline item
      instance.current.viewer.scrollPageIntoView({ dest, pageIndex, pageNumber });

      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith({ dest, pageIndex, pageNumber });
    });

    it('attempts to find a page and scroll it into view if onItemClick is not given', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
      const instance = createRef();

      render(<Document file={pdfFile.file} onLoadSuccess={onLoadSuccess} ref={instance} />);

      expect.assertions(1);

      await onLoadSuccessPromise;

      const scrollIntoView = jest.fn();

      const dest = [];
      const pageIndex = 5;
      const pageNumber = 6;

      // Register fake page in Document viewer
      instance.current.pages[pageIndex] = { scrollIntoView };

      // Simulate clicking on an outline item
      instance.current.viewer.scrollPageIntoView({ dest, pageIndex, pageNumber });

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  describe('linkService', () => {
    it.each`
      externalLinkTarget | target
      ${null}            | ${null}
      ${'_self'}         | ${'_self'}
      ${'_blank'}        | ${'_blank'}
      ${'_parent'}       | ${'_parent'}
      ${'_top'}          | ${'_top'}
    `(
      'returns externalLinkTarget = $target given externalLinkTarget prop = $externalLinkTarget',
      async ({ externalLinkTarget, target }) => {
        const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

        const instance = createRef();

        render(
          <Document
            externalLinkTarget={externalLinkTarget}
            file={pdfFile.file}
            onLoadSuccess={onLoadSuccess}
            ref={instance}
          />,
        );

        expect.assertions(1);

        await onLoadSuccessPromise;

        expect(instance.current.linkService.externalLinkTarget).toBe(target);
      },
    );
  });

  it.each`
    externalLinkRel | rel
    ${null}         | ${null}
    ${'_self'}      | ${'_self'}
    ${'_blank'}     | ${'_blank'}
    ${'_parent'}    | ${'_parent'}
    ${'_top'}       | ${'_top'}
  `(
    'returns externalLinkRel = $rel given externalLinkRel prop = $externalLinkRel',
    async ({ externalLinkRel, rel }) => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
      const instance = createRef();

      render(
        <Document
          externalLinkRel={externalLinkRel}
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          ref={instance}
        />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      expect(instance.current.linkService.externalLinkRel).toBe(rel);
    },
  );

  it('calls onClick callback when clicked a page (sample of mouse events family)', () => {
    const onClick = jest.fn();

    const { container } = render(<Document onClick={onClick} />);

    const document = container.querySelector('.react-pdf__Document');
    fireEvent.click(document);

    expect(onClick).toHaveBeenCalled();
  });

  it('calls onTouchStart callback when touched a page (sample of touch events family)', () => {
    const onTouchStart = jest.fn();

    const { container } = render(<Document onTouchStart={onTouchStart} />);

    const document = container.querySelector('.react-pdf__Document');
    fireEvent.touchStart(document);

    expect(onTouchStart).toHaveBeenCalled();
  });
});
