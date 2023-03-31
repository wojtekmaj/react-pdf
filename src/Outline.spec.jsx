import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { pdfjs } from './index.test';

import Outline from './Outline';

import failingPdf from '../__mocks__/_failing_pdf';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../test-utils';

import DocumentContext from './DocumentContext';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');

function renderWithContext(children, context) {
  const { rerender, ...otherResult } = render(
    <DocumentContext.Provider value={context}>{children}</DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (nextChildren, nextContext = context) =>
      rerender(
        <DocumentContext.Provider value={nextContext}>{nextChildren}</DocumentContext.Provider>,
      ),
  };
}

describe('Outline', () => {
  // Loaded PDF file
  let pdf;
  let pdf2;

  // Object with basic loaded outline information that shall match after successful loading
  let desiredLoadedOutline = null;
  let desiredLoadedOutline2 = null;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;
    pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;

    desiredLoadedOutline = await pdf.getOutline();
    desiredLoadedOutline2 = await pdf2.getOutline();
  });

  describe('loading', () => {
    it('loads an outline and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);
    });

    it('calls onLoadError when failed to load an outline', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      renderWithContext(<Outline onLoadError={onLoadError} />, { pdf: failingPdf });

      expect.assertions(1);

      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces an outline properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(<Outline onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(2);

      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Outline onLoadSuccess={onLoadSuccess2} />, { pdf: pdf2 });

      // It would have been .toMatchObject if not for the fact _pdf2.pdf has no outline
      await expect(onLoadSuccessPromise2).resolves.toBe(desiredLoadedOutline2);
    });

    it('throws an error when placed outside Document', () => {
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

      const inputRef = vi.fn();

      renderWithContext(<Outline inputRef={inputRef} onLoadSuccess={onLoadSuccess} />, { pdf });

      expect.assertions(2);

      await onLoadSuccessPromise;

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef).toHaveBeenCalledWith(expect.any(HTMLElement));
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
