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
    transform: [],
    width: 0,
  };

  describe('rendering', () => {
    it('renders text content properly', () => {
      const component = shallow(
        <TextLayerItem
          {...defaultProps}
          str="Test"
        />,
        {
          context: {
            page,
          },
        },
      );

      const textItem = component.text();
      expect(textItem).toEqual('Test');
    });

    it('renders text content properly given customTextRenderer', () => {
      const customTextRenderer = () => 'Test';

      const component = shallow(
        <TextLayerItem
          {...defaultProps}
          str="Potato"
        />,
        {
          context: {
            page,
            customTextRenderer,
          },
        },
      );

      const textItem = component.text();
      expect(textItem).toEqual('Test');
    });
  });
});
