import React from 'react';
import { shallow, mount } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import {} from '../entry.noworker';
import OutlineItem from '../OutlineItem';

import { loadPDF, makeAsyncCallback } from './utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('OutlineItem', () => {
  // Loaded PDF file
  let pdf;

  // Object with basic loaded outline item information
  let outlineItem = null;

  beforeAll(async () => {
    pdf = await PDFJS.getDocument({ data: fileArrayBuffer });

    const outlineItems = await pdf.getOutline();
    [outlineItem] = outlineItems;
  });

  describe('rendering', () => {
    it('renders an item properly', () => {
      const component = shallow(
        <OutlineItem item={outlineItem} />,
        {
          context: {
            pdf,
          }
        }
      );

      const title = component.find('a').first();

      expect(title.text()).toBe(outlineItem.title);
    });

    it('renders item\'s subitems properly', () => {
      const component = mount(
        <OutlineItem item={outlineItem} />,
        {
          context: {
            pdf,
          }
        }
      );

      const subitems = component.children().find('OutlineItem');

      expect(subitems).toHaveLength(outlineItem.items.length);
    });

    it('calls onClick with proper arguments when clicked a link', () => {
      const { func: onClick, promise: onClickPromise } = makeAsyncCallback();

      const component = mount(
        <OutlineItem item={outlineItem} />,
        {
          context: {
            onClick,
            pdf,
          }
        }
      );

      const title = component.find('a').first();
      title.simulate('click');

      return onClickPromise.then(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });
  });
});
