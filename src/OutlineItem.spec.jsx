import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, getAllByRole, render, screen } from '@testing-library/react';

import { pdfjs } from './index.test';
import OutlineItem from './OutlineItem';

import { loadPDF, makeAsyncCallback } from '../test-utils';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

function renderWithContext(children, documentContext, outlineContext) {
  const { rerender, ...otherResult } = render(
    <DocumentContext.Provider value={documentContext}>
      <OutlineContext.Provider value={outlineContext}>{children}</OutlineContext.Provider>
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (
      nextChildren,
      nextDocumentContext = documentContext,
      nextOutlineContext = outlineContext,
    ) =>
      rerender(
        <DocumentContext.Provider value={nextDocumentContext}>
          <OutlineContext.Provider value={nextOutlineContext}>
            {nextChildren}
          </OutlineContext.Provider>
        </DocumentContext.Provider>,
      ),
  };
}

describe('OutlineItem', () => {
  // Loaded PDF file
  let pdf;

  // Object with basic loaded outline item information
  let outlineItem;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    const outlineItems = await pdf.getOutline();
    [outlineItem] = outlineItems;
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

      const item = screen.getAllByRole('listitem')[0];
      const subitems = getAllByRole(item, 'listitem');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onClick with proper arguments when clicked a link', async () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      renderWithContext(<OutlineItem item={outlineItem} />, { pdf }, { onClick });

      const item = screen.getAllByRole('listitem')[0];
      const link = getAllByRole(item, 'link')[0];
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

      const item = screen.getAllByRole('listitem')[0];
      const link = getAllByRole(item, 'link')[0];
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
