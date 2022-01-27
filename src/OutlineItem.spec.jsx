import React from 'react';
import { shallow, mount } from 'enzyme';

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
      const component = shallow(<OutlineItem item={outlineItem} pdf={pdf} />);

      const title = component.find('a').first();

      expect(title.text()).toBe(outlineItem.title);
    });

    it("renders item's subitems properly", () => {
      const component = mount(<OutlineItem item={outlineItem} pdf={pdf} />);

      const subitems = component.children().find('OutlineItemInternal');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onClick with proper arguments when clicked a link', () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      const component = mount(<OutlineItem item={outlineItem} onClick={onClick} pdf={pdf} />);

      const title = component.find('a').first();
      title.simulate('click');

      return onClickPromise.then(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });
  });
});
