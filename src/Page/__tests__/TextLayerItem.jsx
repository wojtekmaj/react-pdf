import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import {} from '../../entry.noworker';
import TextLayerItem from '../TextLayerItem';

import { loadPDF } from '../../__tests__/utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

describe('TextLayerItem', () => {
  // Loaded page
  let page;

  beforeAll(async () => {
    const pdf = await PDFJS.getDocument({ data: fileArrayBuffer });

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
          str={str}
        />,
        {
          context: {
            page,
          },
        },
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
          itemIndex={itemIndex}
          str={str}
        />,
        {
          context: {
            page,
            customTextRenderer,
          },
        },
      );

      expect(customTextRenderer).toBeCalledWith(
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
        />,
        {
          context: {
            page,
            customTextRenderer,
          },
        },
      );

      const textItem = component.text();
      expect(textItem).toEqual('Test value');
    });
  });
});
