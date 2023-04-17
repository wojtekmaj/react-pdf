import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, getAllByRole, render, screen } from '@testing-library/react';

import { pdfjs } from './index.test';
import OutlineItem from './OutlineItem';

import { loadPDF, makeAsyncCallback } from '../test-utils';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentContextType, OutlineContextType } from './shared/types';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;
type PDFOutlineItem = PDFOutline[number];

function renderWithContext(
  children: React.ReactNode,
  documentContext: Partial<DocumentContextType>,
  outlineContext: Partial<OutlineContextType>,
) {
  const { rerender, ...otherResult } = render(
    <DocumentContext.Provider value={documentContext as DocumentContextType}>
      <OutlineContext.Provider value={outlineContext as OutlineContextType}>
        {children}
      </OutlineContext.Provider>
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (
      nextChildren: React.ReactNode,
      nextDocumentContext: Partial<DocumentContextType> = documentContext,
      nextOutlineContext: Partial<OutlineContextType> = outlineContext,
    ) =>
      rerender(
        <DocumentContext.Provider value={nextDocumentContext as DocumentContextType}>
          <OutlineContext.Provider value={nextOutlineContext as OutlineContextType}>
            {nextChildren}
          </OutlineContext.Provider>
        </DocumentContext.Provider>,
      ),
  };
}

describe('OutlineItem', () => {
  // Loaded PDF file
  let pdf: PDFDocumentProxy;

  // Object with basic loaded outline item information
  let outlineItem: PDFOutlineItem;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    const outlineItems = await pdf.getOutline();
    [outlineItem] = outlineItems as [PDFOutlineItem];
  });

  describe('rendering', () => {
    it('renders an item properly', () => {
      const onClick = vi.fn();

      renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onClick });

      const item = screen.getAllByRole('listitem')[0];

      expect(item).toHaveTextContent(outlineItem.title);
    });

    it("renders item's subitems properly", () => {
      const onClick = vi.fn();

      renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onClick });

      const item = screen.getAllByRole('listitem')[0] as HTMLElement;
      const subitems = getAllByRole(item, 'listitem');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onClick with proper arguments when clicked a link', async () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onClick });

      const item = screen.getAllByRole('listitem')[0] as HTMLElement;
      const link = getAllByRole(item, 'link')[0] as HTMLAnchorElement;
      fireEvent.click(link);

      await onClickPromise;

      expect(onClick).toHaveBeenCalled();
    });

    it('calls onClick with proper arguments multiple times when clicked a link multiple times', async () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(
        <OutlineItem item={outlineItem} />,
        { pdf },
        { onClick },
      );

      const item = screen.getAllByRole('listitem')[0] as HTMLElement;
      const link = getAllByRole(item, 'link')[0] as HTMLAnchorElement;
      fireEvent.click(link);

      await onClickPromise;

      expect(onClick).toHaveBeenCalledTimes(1);

      const { func: onClick2, promise: onClickPromise2 } = makeAsyncCallback();

      rerender(<OutlineItem item={outlineItem} />, { pdf }, { onClick: onClick2 });

      fireEvent.click(link);

      await onClickPromise2;

      expect(onClick2).toHaveBeenCalledTimes(1);
    });
  });
});
