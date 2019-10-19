import React from 'react';
import { shallow } from 'enzyme';

import { pdfjs } from '../entry.jest';

import { TextLayerItemInternal as TextLayerItem } from './TextLayerItem';

import { loadPDF } from '../../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('TextLayerItem', () => {
  // Loaded page
  let page;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
  });

  const defaultProps = {
    fontName: '',
    itemIndex: 0,
    str: 'Test',
    transform: [],
    width: 0,
  };

  describe('rendering', () => {
    it('renders text content properly', () => {
      const str = 'Test string';

      const component = shallow(
        <TextLayerItem
          {...defaultProps}
          page={page}
          str={str}
        />
      );

      const textItem = component.text();
      expect(textItem).toEqual(str);
    });

    it('calls customTextRenderer with necessary arguments', () => {
      const customTextRenderer = jest.fn();
      const str = 'Test string';
      const itemIndex = 5;

      shallow(
        <TextLayerItem
          {...defaultProps}
          customTextRenderer={customTextRenderer}
          itemIndex={itemIndex}
          page={page}
          str={str}
        />
      );

      expect(customTextRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          str,
          itemIndex,
        }),
      );
    });

    it('renders text content properly given customTextRenderer', () => {
      const customTextRenderer = () => 'Test value';

      const component = shallow(
        <TextLayerItem
          {...defaultProps}
          customTextRenderer={customTextRenderer}
          page={page}
        />
      );

      const textItem = component.text();
      expect(textItem).toEqual('Test value');
    });
  });
});
