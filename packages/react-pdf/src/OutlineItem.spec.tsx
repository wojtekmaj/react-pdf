import { beforeAll, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import DocumentContext from './DocumentContext.js';
import { pdfjs } from './index.test.js';
import OutlineContext from './OutlineContext.js';
import OutlineItem from './OutlineItem.js';

import { loadPDF, makeAsyncCallback } from '../../../test-utils.js';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentContextType, OutlineContextType } from './shared/types.js';

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;
type PDFOutlineItem = PDFOutline[number];

async function renderWithContext(
  children: React.ReactNode,
  documentContext: Partial<DocumentContextType>,
  outlineContext: Partial<OutlineContextType>,
) {
  const { rerender, ...otherResult } = await render(
    <DocumentContext.Provider value={documentContext as DocumentContextType}>
      <OutlineContext.Provider value={outlineContext as OutlineContextType}>
        {children}
      </OutlineContext.Provider>
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: async (
      nextChildren: React.ReactNode,
      nextDocumentContext: Partial<DocumentContextType> = documentContext,
      nextOutlineContext: Partial<OutlineContextType> = outlineContext,
    ) =>
      await rerender(
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
    it('renders an item properly', async () => {
      const onItemClick = vi.fn();

      await renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onItemClick });

      const item = page.getByRole('listitem').first();

      expect(item).toHaveTextContent(outlineItem.title);
    });

    it("renders item's subitems properly", async () => {
      const onItemClick = vi.fn();

      await renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onItemClick });

      const item = page.getByRole('listitem').first();
      const subitems = item.getByRole('listitem');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onItemClick with proper arguments when clicked a link', async () => {
      const { func: onItemClick, promise: onItemClickPromise } = makeAsyncCallback();

      await renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onItemClick });

      const item = page.getByRole('listitem').first();
      const link = item.getByRole('link').first();
      await userEvent.click(link);

      await onItemClickPromise;

      expect(onItemClick).toHaveBeenCalled();
    });

    it('calls onItemClick with proper arguments multiple times when clicked a link multiple times', async () => {
      const { func: onItemClick, promise: onItemClickPromise } = makeAsyncCallback();

      const { rerender } = await renderWithContext(
        <OutlineItem item={outlineItem} />,
        { pdf },
        { onItemClick },
      );

      const item = page.getByRole('listitem').first();
      const link = item.getByRole('link').first();
      await userEvent.click(link);

      await onItemClickPromise;

      expect(onItemClick).toHaveBeenCalledTimes(1);

      const { func: onItemClick2, promise: onItemClickPromise2 } = makeAsyncCallback();

      await rerender(<OutlineItem item={outlineItem} />, { pdf }, { onItemClick: onItemClick2 });

      await userEvent.click(link);

      await onItemClickPromise2;

      expect(onItemClick2).toHaveBeenCalledTimes(1);
    });
  });
});
