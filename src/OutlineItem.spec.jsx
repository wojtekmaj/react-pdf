import React from 'react';
import { fireEvent, getAllByRole, render, screen } from '@testing-library/react';

import { pdfjs } from './entry.jest';
import { OutlineItemInternal as OutlineItem } from './OutlineItem';

import { loadPDF, makeAsyncCallback } from '../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

describe('OutlineItem', () => {
  // Loaded PDF file
  let pdf;

  // Object with basic loaded outline item information
  let outlineItem = null;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    const outlineItems = await pdf.getOutline();
    [outlineItem] = outlineItems;
  });

  describe('rendering', () => {
    it('renders an item properly', () => {
      render(<OutlineItem item={outlineItem} pdf={pdf} />);

      const item = screen.getAllByRole('listitem')[0];

      expect(item).toHaveTextContent(outlineItem.title);
    });

    it("renders item's subitems properly", () => {
      render(<OutlineItem item={outlineItem} pdf={pdf} />);

      const item = screen.getAllByRole('listitem')[0];
      const subitems = getAllByRole(item, 'listitem');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onClick with proper arguments when clicked a link', async () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      render(<OutlineItem item={outlineItem} onClick={onClick} pdf={pdf} />);

      const item = screen.getAllByRole('listitem')[0];
      const link = getAllByRole(item, 'link')[0];
      fireEvent.click(link);

      await onClickPromise;

      expect(onClick).toHaveBeenCalled();
    });
  });
});
