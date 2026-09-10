import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import * as React from 'react';
import { createRef, StrictMode, Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Document from './Document.js';
import DocumentContext from './DocumentContext.js';
import { pdfjs } from './index.test.js';
import Page from './Page.js';
import PasswordResponses from './PasswordResponses.js';

import {
  createDeferred,
  loadPDF,
  makeAsyncCallback,
  muteConsole,
  restoreConsole,
} from '../../../test-utils.js';

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { FallbackProps } from 'react-error-boundary';
import type LinkService from './LinkService.js';
import type { File, ScrollPageIntoViewArgs } from './shared/types.js';

vi.mock(import('pdfjs-dist'), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, getDocument: vi.fn(actual.getDocument) };
});

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');
const pdfFile2 = await loadPDF('../../__mocks__/_pdf2.pdf');

const OK = Symbol('OK');

// Activity is only available in React 19.2 and later
const { Activity } = React as unknown as {
  Activity: React.ComponentType<{
    children?: React.ReactNode;
    mode: 'hidden' | 'visible';
  }>;
};

const itIfActivityDefined = it.runIf(typeof Activity !== 'undefined');

function ChildInternal({
  renderMode,
  rotate,
  scale,
}: {
  renderMode?: string | null;
  rotate?: number | null;
  scale?: number | null;
}) {
  return (
    <div data-testid="child" data-rendermode={renderMode} data-rotate={rotate} data-scale={scale} />
  );
}

function Child(props: React.ComponentProps<typeof ChildInternal>) {
  return (
    <DocumentContext.Consumer>
      {(context) => <ChildInternal {...context} {...props} />}
    </DocumentContext.Consumer>
  );
}

async function waitForAsync() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function renderError({ error }: FallbackProps): React.ReactNode {
  return <div role="alert">{error instanceof Error ? error.message : String(error)}</div>;
}

describe('Document', () => {
  // Object with basic loaded PDF information that shall match after successful loading
  const desiredLoadedPdf: Partial<PDFDocumentProxy> = {};
  const desiredLoadedPdf2: Partial<PDFDocumentProxy> = {};

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

      await render(
        <Document
          file={pdfFile.dataURI}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(2);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly (param object)', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={{ url: pdfFile.dataURI }}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(2);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via ArrayBuffer properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.arrayBuffer}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(2);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via Blob properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.blob}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(2);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via File properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(2);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);
    });

    it('fails to load a file and calls onSourceError given invalid file source', async () => {
      const { func: onSourceError, promise: onSourceErrorPromise } = makeAsyncCallback();

      muteConsole();

      // @ts-expect-error-next-line
      await render(<Document file={() => null} onSourceError={onSourceError} suspense={false} />);

      expect.assertions(1);

      const [error] = await onSourceErrorPromise;

      expect(error).toMatchObject(expect.any(Error));

      restoreConsole();
    });

    it('replaces a file properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = await render(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
          suspense={false}
        />,
      );

      expect.assertions(4);

      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPdf]);

      const { func: onSourceSuccess2, promise: onSourceSuccessPromise2 } = makeAsyncCallback(OK);
      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      await rerender(
        <Document
          file={pdfFile2.file}
          onLoadSuccess={onLoadSuccess2}
          onSourceSuccess={onSourceSuccess2}
          suspense={false}
        />,
      );

      await expect(onSourceSuccessPromise2).resolves.toBe(OK);
      await expect(onLoadSuccessPromise2).resolves.toMatchObject([desiredLoadedPdf2]);
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', async () => {
      const className = 'testClassName';

      const { container } = await render(<Document className={className} suspense={false} />);

      const wrapper = container.querySelector('.react-pdf__Document');

      expect(wrapper).toHaveClass(className);
    });

    it('passes container element to inputRef properly', async () => {
      const inputRef = createRef<HTMLDivElement>();

      await render(<Document inputRef={inputRef} suspense={false} />);

      expect(inputRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders "No PDF file specified." when given nothing', async () => {
      const { container } = await render(<Document suspense={false} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('No PDF file specified.');
    });

    it('renders custom no data message when given nothing and noData prop is given', async () => {
      const { container } = await render(<Document noData="Nothing here" suspense={false} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');
    });

    it('renders custom no data message when given nothing and noData prop is given as a function', async () => {
      const { container } = await render(
        <Document noData={() => 'Nothing here'} suspense={false} />,
      );

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');
    });

    it('renders "Loading PDF…" when loading a file', async () => {
      const { container } = await render(<Document file={pdfFile.file} suspense={false} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      await expect.element(page.getByText('Loading PDF…')).toBeInTheDocument();
    });

    it('renders custom loading message when loading a file and loading prop is given', async () => {
      const { container } = await render(
        <Document file={pdfFile.file} loading="Loading" suspense={false} />,
      );

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      await expect.element(page.getByText('Loading')).toBeInTheDocument();
    });

    it('renders custom loading message when loading a file and loading prop is given as a function', async () => {
      const { container } = await render(
        <Document file={pdfFile.file} loading={() => 'Loading'} suspense={false} />,
      );

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      await expect.element(page.getByText('Loading')).toBeInTheDocument();
    });

    it('renders "Failed to load PDF file." when failed to load a document', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = await render(
        <Document file={failingPdf} onLoadError={onLoadError} suspense={false} />,
      );

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();
      await expect.element(page.getByText('Failed to load PDF file.')).toBeInTheDocument();

      restoreConsole();
    });

    it('renders custom error message when failed to load a document and error prop is given', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = await render(
        <Document error="Error" file={failingPdf} onLoadError={onLoadError} suspense={false} />,
      );

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();

      await expect.element(page.getByText('Error', { exact: true })).toBeInTheDocument();

      restoreConsole();
    });

    it('renders custom error message when failed to load a document and error prop is given as a function', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const { container } = await render(
        <Document error="Error" file={failingPdf} onLoadError={onLoadError} suspense={false} />,
      );

      expect.assertions(2);

      await onLoadErrorPromise;

      await waitForAsync();

      const error = container.querySelector('.react-pdf__message');

      expect(error).toBeInTheDocument();

      await expect.element(page.getByText('Error', { exact: true })).toBeInTheDocument();

      restoreConsole();
    });

    it('passes renderMode prop to its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="custom"
          suspense={false}
        >
          <Child />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.rendermode).toBe('custom');
    });

    it('passes rotate prop to its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          rotate={90}
          suspense={false}
        >
          <Child />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.rotate).toBe('90');
    });

    it('passes scale prop to its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          scale={1.5}
          suspense={false}
        >
          <Child />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.scale).toBe('1.5');
    });

    it('does not overwrite renderMode prop in its children when given renderMode prop to both Document and its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="canvas"
          suspense={false}
        >
          <Child renderMode="custom" />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.rendermode).toBe('custom');
    });

    it('does not overwrite rotate prop in its children when given rotate prop to both Document and its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          rotate={90}
          suspense={false}
        >
          <Child rotate={180} />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.rotate).toBe('180');
    });

    it('does not overwrite scale prop in its children when given scale prop to both Document and its children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          scale={1.5}
          suspense={false}
        >
          <Child scale={2} />
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByTestId('child').element();

      expect(child.dataset.scale).toBe('2');
    });

    it('supports function as children', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          suspense={false}
        >
          {({ pdf }) => <p>{`This PDF has ${pdf.numPages} pages`}</p>}
        </Document>,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const child = page.getByText('This PDF has 4 pages');

      expect(child).toBeInTheDocument();
    });
  });

  describe('viewer', () => {
    it('calls onItemClick if defined', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const onItemClick = vi.fn();
      const instance = createRef<{
        linkService: React.RefObject<LinkService>;
        pages: React.RefObject<HTMLDivElement[]>;
        viewer: React.RefObject<{ scrollPageIntoView: (args: ScrollPageIntoViewArgs) => void }>;
      }>();

      await render(
        <Document
          file={pdfFile.file}
          onItemClick={onItemClick}
          onLoadSuccess={onLoadSuccess}
          ref={instance}
          suspense={false}
        />,
      );

      if (!instance.current) {
        throw new Error('Document ref is not set');
      }

      if (!instance.current.viewer.current) {
        throw new Error('Viewer ref is not set');
      }

      expect.assertions(2);

      await onLoadSuccessPromise;

      const dest: number[] = [];
      const pageIndex = 5;
      const pageNumber = 6;

      // Simulate clicking on an outline item
      instance.current.viewer.current.scrollPageIntoView({ dest, pageIndex, pageNumber });

      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith({ dest, pageIndex, pageNumber });
    });

    it('attempts to find a page and scroll it into view if onItemClick is not given', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const instance = createRef<{
        linkService: React.RefObject<LinkService>;
        // biome-ignore lint/suspicious/noExplicitAny: Intentional use to simplify the test
        pages: React.RefObject<any[]>;
        viewer: React.RefObject<{ scrollPageIntoView: (args: ScrollPageIntoViewArgs) => void }>;
      }>();

      await render(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          ref={instance}
          suspense={false}
        />,
      );

      if (!instance.current) {
        throw new Error('Document ref is not set');
      }

      if (!instance.current.pages.current) {
        throw new Error('Pages ref is not set');
      }

      if (!instance.current.viewer.current) {
        throw new Error('Viewer ref is not set');
      }

      expect.assertions(1);

      await onLoadSuccessPromise;

      const scrollIntoView = vi.fn();

      const dest: number[] = [];
      const pageIndex = 5;
      const pageNumber = 6;

      // Register fake page in Document viewer
      instance.current.pages.current[pageIndex] = { scrollIntoView };

      // Simulate clicking on an outline item
      instance.current.viewer.current.scrollPageIntoView({ dest, pageIndex, pageNumber });

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  describe('linkService', () => {
    it.each`
      externalLinkTarget | target
      ${null}            | ${''}
      ${'_self'}         | ${'_self'}
      ${'_blank'}        | ${'_blank'}
      ${'_parent'}       | ${'_parent'}
      ${'_top'}          | ${'_top'}
    `(
      'returns externalLinkTarget = $target given externalLinkTarget prop = $externalLinkTarget',
      async ({ externalLinkTarget, target }) => {
        const {
          func: onRenderAnnotationLayerSuccess,
          promise: onRenderAnnotationLayerSuccessPromise,
        } = makeAsyncCallback();

        const { container } = await render(
          <Document externalLinkTarget={externalLinkTarget} file={pdfFile.file} suspense={false}>
            <Page
              onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
              renderMode="none"
              pageNumber={1}
              suspense={false}
            />
          </Document>,
        );

        expect.assertions(1);

        await onRenderAnnotationLayerSuccessPromise;

        const link = container.querySelector('a') as HTMLAnchorElement;

        expect(link.target).toBe(target);
      },
    );

    it.each`
      externalLinkRel | rel
      ${null}         | ${'noopener noreferrer nofollow'}
      ${'noopener'}   | ${'noopener'}
      ${'noreferrer'} | ${'noreferrer'}
      ${'nofollow'}   | ${'nofollow'}
    `(
      'returns externalLinkRel = $rel given externalLinkRel prop = $externalLinkRel',
      async ({ externalLinkRel, rel }) => {
        const {
          func: onRenderAnnotationLayerSuccess,
          promise: onRenderAnnotationLayerSuccessPromise,
        } = makeAsyncCallback();

        const { container } = await render(
          <Document externalLinkRel={externalLinkRel} file={pdfFile.file} suspense={false}>
            <Page
              onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
              renderMode="none"
              pageNumber={1}
              suspense={false}
            />
          </Document>,
        );

        expect.assertions(1);

        await onRenderAnnotationLayerSuccessPromise;

        const link = container.querySelector('a') as HTMLAnchorElement;

        expect(link.rel).toBe(rel);
      },
    );
  });

  it('calls onClick callback when clicked a document (sample of mouse events family)', async () => {
    const onClick = vi.fn();

    const { container } = await render(<Document onClick={onClick} suspense={false} />);

    const document = container.querySelector('.react-pdf__Document') as HTMLDivElement;
    await userEvent.click(document);

    expect(onClick).toHaveBeenCalled();
  });

  function triggerTouchStart(element: HTMLElement) {
    element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
  }

  it('calls onTouchStart callback when touched a document (sample of touch events family)', async () => {
    const onTouchStart = vi.fn();

    const { container } = await render(<Document onTouchStart={onTouchStart} suspense={false} />);

    const document = container.querySelector('.react-pdf__Document') as HTMLDivElement;
    triggerTouchStart(document);

    expect(onTouchStart).toHaveBeenCalled();
  });

  it('does not warn if file prop was memoized', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const file = { url: pdfFile.dataURI };

    const { rerender } = await render(<Document file={file} suspense={false} />);

    await rerender(<Document file={file} suspense={false} />);

    expect(spy).not.toHaveBeenCalled();

    vi.mocked(globalThis.console.error).mockReset();
  });

  it('warns if file prop was not memoized', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const { rerender } = await render(
      <Document file={{ url: pdfFile.dataURI }} suspense={false} />,
    );

    await rerender(<Document file={{ url: pdfFile.dataURI }} suspense={false} />);

    expect(spy).toHaveBeenCalledTimes(1);

    vi.mocked(globalThis.console.error).mockReset();
  });

  it('does not warn if file prop was not memoized, but was changed', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const { rerender } = await render(
      <Document file={{ url: pdfFile.dataURI }} suspense={false} />,
    );

    await rerender(<Document file={{ url: pdfFile2.dataURI }} suspense={false} />);

    expect(spy).not.toHaveBeenCalled();

    vi.mocked(globalThis.console.error).mockRestore();
  });

  it('does not warn if options prop was memoized', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const options = {};

    const { rerender } = await render(
      <Document file={pdfFile.blob} options={options} suspense={false} />,
    );

    await rerender(<Document file={pdfFile.blob} options={options} suspense={false} />);

    expect(spy).not.toHaveBeenCalled();

    vi.mocked(globalThis.console.error).mockRestore();
  });

  it('warns if options prop was not memoized', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const { rerender } = await render(
      <Document file={pdfFile.blob} options={{}} suspense={false} />,
    );

    await rerender(<Document file={pdfFile.blob} options={{}} suspense={false} />);

    expect(spy).toHaveBeenCalledTimes(1);

    vi.mocked(globalThis.console.error).mockRestore();
  });

  it('does not warn if options prop was not memoized, but was changed', async () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {
      // Intentionally empty
    });

    const { rerender } = await render(
      <Document file={pdfFile.blob} options={{}} suspense={false} />,
    );

    await rerender(
      <Document file={pdfFile.blob} options={{ maxImageSize: 100 }} suspense={false} />,
    );

    expect(spy).not.toHaveBeenCalled();

    vi.mocked(globalThis.console.error).mockRestore();
  });

  it('does not throw an error on unmount', async () => {
    const { func: onLoadProgress, promise: onLoadProgressPromise } = makeAsyncCallback();

    const { unmount } = await render(
      <Document file={pdfFile} onLoadProgress={onLoadProgress} suspense={false} />,
    );

    await onLoadProgressPromise;

    expect(unmount).not.toThrowError();
  });

  itIfActivityDefined(
    'does not throw an error when hidden and revealed by <Activity>',
    async () => {
      const onRenderTextLayerSuccess = vi.fn();

      const children = (
        <Document file={pdfFile.dataURI} suspense={false}>
          <Page
            onRenderTextLayerSuccess={onRenderTextLayerSuccess}
            pageNumber={1}
            suspense={false}
          />
        </Document>
      );

      const { rerender } = await render(<Activity mode="visible">{children}</Activity>);

      await vi.waitFor(() => expect(onRenderTextLayerSuccess).toHaveBeenCalledTimes(1));

      await rerender(<Activity mode="hidden">{children}</Activity>);
      await rerender(<Activity mode="visible">{children}</Activity>);

      await vi.waitFor(() => expect(onRenderTextLayerSuccess).toHaveBeenCalledTimes(2));
    },
  );

  describe('Suspense', () => {
    const documents: PDFDocumentLoadingTask[] = [];

    async function loadDocument(data = pdfFile.arrayBuffer): Promise<PDFDocumentProxy> {
      const task = pdfjs.getDocument({ data });
      documents.push(task);

      return task.promise;
    }

    afterAll(async () => {
      await Promise.all(documents.map((task) => task.destroy()));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('reuses memoized file and options when their owner initially suspends in Strict Mode', async () => {
      const pdf = await loadDocument();
      const pending = createDeferred<PDFDocumentProxy>();
      const task = {
        promise: pending.promise,
        destroy: vi.fn(async () => {}),
      } as unknown as PDFDocumentLoadingTask;
      vi.mocked(pdfjs.getDocument).mockClear().mockReturnValueOnce(task);

      function Viewer() {
        const file = useMemo(() => ({ url: 'memoized-inputs.pdf' }), []);
        const options = useMemo(() => ({ httpHeaders: { Authorization: 'test' } }), []);

        return (
          <Document file={file} options={options}>
            <p>Document ready</p>
          </Document>
        );
      }

      await render(
        <StrictMode>
          <Suspense fallback={<p>Loading document</p>}>
            <Viewer />
          </Suspense>
        </StrictMode>,
      );

      await expect.element(page.getByText('Loading document')).toBeVisible();
      pending.resolve(pdf);

      await expect.element(page.getByText('Document ready')).toBeVisible();
      expect(pdfjs.getDocument).toHaveBeenCalledOnce();
    });

    it('keeps a document load stable while progress and password callbacks update its parent', async () => {
      const pdf = await loadDocument();
      const pending = createDeferred<PDFDocumentProxy>();
      const task = {
        promise: pending.promise,
        destroy: vi.fn(async () => {}),
        onPassword: vi.fn(),
        onProgress: vi.fn(),
      } as unknown as PDFDocumentLoadingTask;
      const source = pdfFile.arrayBuffer;
      const updatePassword = vi.fn();
      vi.mocked(pdfjs.getDocument).mockClear().mockReturnValueOnce(task);

      function Viewer() {
        const [loaded, setLoaded] = useState(0);
        const [passwordRequested, setPasswordRequested] = useState(false);

        return (
          <>
            <p>Loaded {loaded}</p>
            {passwordRequested ? <p>Password requested</p> : null}
            <Suspense fallback={<p>Document loader</p>}>
              <Document
                file={source}
                onLoadProgress={({ loaded }) => setLoaded(loaded)}
                onPassword={(callback) => {
                  setPasswordRequested(true);
                  callback('secret');
                }}
              >
                <p>Document ready</p>
              </Document>
            </Suspense>
          </>
        );
      }

      await render(<Viewer />);
      await expect.element(page.getByText('Document loader')).toBeVisible();

      task.onProgress({ loaded: 50, total: 100 });
      task.onPassword(updatePassword, PasswordResponses.NEED_PASSWORD);

      await expect.element(page.getByText('Loaded 50')).toBeVisible();
      await expect.element(page.getByText('Password requested')).toBeVisible();
      expect(updatePassword).toHaveBeenCalledExactlyOnceWith('secret');

      pending.resolve(pdf);

      await expect.element(page.getByText('Document ready')).toBeVisible();
      expect(pdfjs.getDocument).toHaveBeenCalledOnce();
    });

    it('loads a document and page together under one boundary by default', async () => {
      const source = pdfFile.arrayBuffer;
      const onLoadSuccess = vi.fn();

      await render(
        <Suspense fallback={<p>Loading document</p>}>
          <Document file={source} onLoadSuccess={onLoadSuccess}>
            <Page
              pageNumber={1}
              renderAnnotationLayer={false}
              renderMode="none"
              renderTextLayer={false}
            >
              <p>Document ready</p>
            </Page>
          </Document>
        </Suspense>,
      );

      await expect.element(page.getByText('Document ready')).toBeVisible();
      expect(onLoadSuccess).toHaveBeenCalledOnce();
      expect(source.byteLength).toBeGreaterThan(0);
    });

    it.each([false, true])(
      'scrolls to a page loaded under the same boundary with suspense=%s',
      async (suspense) => {
        const documentRef = createRef<React.ComponentRef<typeof Document>>();

        const { container } = await render(
          <Suspense fallback={<p>Loading document</p>}>
            <Document file={pdfFile.arrayBuffer} ref={documentRef} suspense={suspense}>
              <Page
                pageNumber={1}
                renderAnnotationLayer={false}
                renderMode="none"
                renderTextLayer={false}
              >
                <p>Page ready</p>
              </Page>
            </Document>
          </Suspense>,
        );

        await expect.element(page.getByText('Page ready')).toBeVisible();

        const pageElement = container.querySelector('.react-pdf__Page');

        if (!documentRef.current || !pageElement) {
          throw new Error('Document and page are not ready');
        }

        const scrollIntoView = vi.spyOn(pageElement, 'scrollIntoView');

        documentRef.current.viewer.current.scrollPageIntoView({
          dest: [],
          pageIndex: 0,
          pageNumber: 1,
        });

        expect(scrollIntoView).toHaveBeenCalledOnce();
      },
    );

    it.each(['arrayBuffer', 'blob', 'file', 'dataURI'] as const)(
      'loads a %s source',
      async (kind) => {
        await render(
          <Suspense fallback={<p>Loading document</p>}>
            <Document file={pdfFile[kind]}>
              <p>Document ready</p>
            </Document>
          </Suspense>,
        );

        await expect.element(page.getByText('Document ready')).toBeVisible();
      },
    );

    it('keeps noData as an ordinary empty state', async () => {
      await render(<Document noData="Choose a PDF" />);

      await expect.element(page.getByText('Choose a PDF')).toBeVisible();
    });

    it('sends document source failures to the boundary and callback', async () => {
      const onSourceError = vi.fn();
      const onError = vi.fn();

      await render(
        <ErrorBoundary fallbackRender={renderError} onError={onError}>
          <Suspense fallback={<p>Loading</p>}>
            <Document file={{ invalid: true } as unknown as File} onSourceError={onSourceError} />
          </Suspense>
        </ErrorBoundary>,
      );

      await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent(
          'Invariant failed: Invalid parameter object: need either .data, .range or .url',
        );
      expect(onSourceError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
    });

    it('sends PDF loading failures to the boundary and callback', async () => {
      const onLoadError = vi.fn();

      await render(
        <ErrorBoundary fallbackRender={renderError}>
          <Suspense fallback={<p>Loading</p>}>
            <Document file={new ArrayBuffer(0)} onLoadError={onLoadError} />
          </Suspense>
        </ErrorBoundary>,
      );

      await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('The PDF file is empty, i.e. its size is zero bytes.');
      expect(onLoadError).toHaveBeenCalledOnce();
    });

    it('retries unchanged document props after a boundary reset in Strict Mode', async () => {
      const source = pdfFile.arrayBuffer;
      const failure = new Error('Document temporarily unavailable');
      const onLoadError = vi.fn();
      vi.mocked(pdfjs.getDocument)
        .mockClear()
        .mockImplementationOnce(
          () =>
            ({
              promise: Promise.reject(failure),
              destroy: vi.fn(async () => {}),
            }) as unknown as PDFDocumentLoadingTask,
        );

      await render(
        <StrictMode>
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <>
                {renderError({ error, resetErrorBoundary })}
                <button onClick={resetErrorBoundary} type="button">
                  Retry
                </button>
              </>
            )}
          >
            <Suspense fallback={<p>Loading</p>}>
              <Document file={source} onLoadError={onLoadError}>
                <p>Retried</p>
              </Document>
            </Suspense>
          </ErrorBoundary>
        </StrictMode>,
      );

      await expect.element(page.getByRole('alert')).toHaveTextContent(failure.message);
      expect(pdfjs.getDocument).toHaveBeenCalledOnce();
      expect(onLoadError).toHaveBeenCalledExactlyOnceWith(failure);

      await page.getByRole('button', { name: 'Retry' }).click();

      await expect.element(page.getByText('Retried')).toBeVisible();
      expect(pdfjs.getDocument).toHaveBeenCalledTimes(2);
    });

    it('reloads the document when its key changes', async () => {
      const file = pdfFile.arrayBuffer;
      const onLoadSuccess = vi.fn();
      vi.mocked(pdfjs.getDocument).mockClear();

      const { rerender } = await render(
        <Suspense fallback={<p>Loading</p>}>
          <Document file={file} key="first" onLoadSuccess={onLoadSuccess} />
        </Suspense>,
      );

      await vi.waitFor(() => expect(onLoadSuccess).toHaveBeenCalledOnce());

      await rerender(
        <Suspense fallback={<p>Loading</p>}>
          <Document file={file} key="second" onLoadSuccess={onLoadSuccess} />
        </Suspense>,
      );

      await vi.waitFor(() => expect(onLoadSuccess).toHaveBeenCalledTimes(2));
      expect(pdfjs.getDocument).toHaveBeenCalledTimes(2);
    });
  });
});
