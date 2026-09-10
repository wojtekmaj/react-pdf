import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { createRef, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import DocumentContext from './DocumentContext.js';
import { pdfjs } from './index.test.js';
import Outline from './Outline.js';

import failingPdf from '../../../__mocks__/_failing_pdf.js';

import {
  createDeferred,
  loadPDF,
  makeAsyncCallback,
  muteConsole,
  restoreConsole,
} from '../../../test-utils.js';

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { FallbackProps } from 'react-error-boundary';
import type { DocumentContextType } from './shared/types.js';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');
const pdfFile2 = await loadPDF('../../__mocks__/_pdf2.pdf');

async function renderWithContext(children: React.ReactNode, context: Partial<DocumentContextType>) {
  const { rerender, ...otherResult } = await render(
    <DocumentContext.Provider value={{ suspense: false, ...context } as DocumentContextType}>
      {children}
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: async (
      nextChildren: React.ReactNode,
      nextContext: Partial<DocumentContextType> = context,
    ) =>
      await rerender(
        <DocumentContext.Provider
          value={{ suspense: false, ...nextContext } as DocumentContextType}
        >
          {nextChildren}
        </DocumentContext.Provider>,
      ),
  };
}

function renderError({ error }: FallbackProps): React.ReactNode {
  return <div role="alert">{error instanceof Error ? error.message : String(error)}</div>;
}

describe('Outline', () => {
  // Loaded PDF file
  let pdf: PDFDocumentProxy;
  let pdf2: PDFDocumentProxy;

  // Object with basic loaded outline information that shall match after successful loading
  let desiredLoadedOutline: PDFOutline;
  let desiredLoadedOutline2: PDFOutline;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;
    pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;

    desiredLoadedOutline = await pdf.getOutline();
    desiredLoadedOutline2 = await pdf2.getOutline();
  });

  describe('loading', () => {
    it('loads an outline and calls onLoadSuccess callback properly when placed inside Document', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);
    });

    it('loads an outline and calls onLoadSuccess callback properly when pdf prop is passed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await render(<Outline onLoadSuccess={onLoadSuccess} pdf={pdf} />);

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);
    });

    it('calls onLoadError when failed to load an outline', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      await renderWithContext(<Outline onLoadError={onLoadError} />, {
        pdf: failingPdf,
      });

      expect.assertions(1);

      await expect(onLoadErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces an outline properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = await renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, {
        pdf,
      });

      expect.assertions(2);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      await rerender(<Outline onLoadSuccess={onLoadSuccess2} />, { pdf: pdf2 });

      // It would have been .toMatchObject if not for the fact _pdf2.pdf has no outline
      await expect(onLoadSuccessPromise2).resolves.toMatchObject([desiredLoadedOutline2]);
    });

    it('throws an error when placed outside Document without pdf prop passed', async () => {
      muteConsole();

      await expect(render(<Outline />)).rejects.toThrowError(
        'Invariant failed: Attempted to load an outline, but no document was specified. Wrap <Outline /> in a <Document /> or pass explicit `pdf` prop.',
      );

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const className = 'testClassName';

      const { container } = await renderWithContext(
        <Outline className={className} onLoadSuccess={onLoadSuccess} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const wrapper = container.querySelector('.react-pdf__Outline');

      expect(wrapper).toHaveClass(className);
    });

    it('passes container element to inputRef properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const inputRef = createRef<HTMLDivElement>();

      await renderWithContext(<Outline inputRef={inputRef} onLoadSuccess={onLoadSuccess} />, {
        pdf,
      });

      expect.assertions(1);

      await onLoadSuccessPromise;

      expect(inputRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders OutlineItem components properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      await renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await onLoadSuccessPromise;

      const items = page.getByRole('listitem');

      expect(items).toHaveLength(5);
    });
  });

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

    it('waits for outline data and treats a missing outline as success', async () => {
      const pdf = await loadDocument(pdfFile2.arrayBuffer);
      const emptyOutline = await pdf.getOutline();
      const pending = createDeferred<typeof emptyOutline>();
      const onLoadSuccess = vi.fn();
      vi.spyOn(pdf, 'getOutline').mockReturnValue(pending.promise);

      await render(
        <Suspense fallback={<p>Outline loader</p>}>
          <Outline onLoadSuccess={onLoadSuccess} pdf={pdf} />
          <p>Outline ready</p>
        </Suspense>,
      );

      await expect.element(page.getByText('Outline loader')).toBeVisible();
      pending.resolve(emptyOutline);

      await expect.element(page.getByText('Outline ready')).toBeVisible();
      expect(onLoadSuccess).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('forwards outline failures to an Error Boundary', async () => {
      const pdf = await loadDocument();
      vi.spyOn(pdf, 'getOutline').mockRejectedValue(new Error('Outline failed'));

      await render(
        <ErrorBoundary fallbackRender={renderError}>
          <Suspense fallback={<p>Loading outline</p>}>
            <Outline pdf={pdf} />
          </Suspense>
        </ErrorBoundary>,
      );

      await expect.element(page.getByRole('alert')).toHaveTextContent('Outline failed');
    });
  });
});
