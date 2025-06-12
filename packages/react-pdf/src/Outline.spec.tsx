import { beforeAll, describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';

import { pdfjs } from './index.test.js';

import Outline from './Outline.js';

import failingPdf from '../../../__mocks__/_failing_pdf.js';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../test-utils.js';

import DocumentContext from './DocumentContext.js';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentContextType } from './shared/types.js';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');
const pdfFile2 = await loadPDF('../../__mocks__/_pdf2.pdf');

function renderWithContext(children: React.ReactNode, context: Partial<DocumentContextType>) {
  const { rerender, ...otherResult } = render(
    <DocumentContext.Provider value={context as DocumentContextType}>
      {children}
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (
      nextChildren: React.ReactNode,
      nextContext: Partial<DocumentContextType> = context,
    ) =>
      rerender(
        <DocumentContext.Provider value={nextContext as DocumentContextType}>
          {nextChildren}
        </DocumentContext.Provider>,
      ),
  };
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

      renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);
    });

    it('loads an outline and calls onLoadSuccess callback properly when pdf prop is passed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Outline onLoadSuccess={onLoadSuccess} pdf={pdf} />);

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);
    });

    it('calls onLoadError when failed to load an outline', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      renderWithContext(<Outline onLoadError={onLoadError} />, { pdf: failingPdf });

      expect.assertions(1);

      await expect(onLoadErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces an outline properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(2);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedOutline]);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Outline onLoadSuccess={onLoadSuccess2} />, { pdf: pdf2 });

      // It would have been .toMatchObject if not for the fact _pdf2.pdf has no outline
      await expect(onLoadSuccessPromise2).resolves.toMatchObject([desiredLoadedOutline2]);
    });

    it('throws an error when placed outside Document without pdf prop passed', () => {
      muteConsole();

      expect(() => render(<Outline />)).toThrow();

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const className = 'testClassName';

      const { container } = renderWithContext(
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

      renderWithContext(<Outline inputRef={inputRef} onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await onLoadSuccessPromise;

      expect(inputRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('renders OutlineItem components properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await onLoadSuccessPromise;

      const items = screen.getAllByRole('listitem');

      expect(items).toHaveLength(5);
    });
  });
});
