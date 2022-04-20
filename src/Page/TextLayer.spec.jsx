import React from 'react';
import { mount, shallow } from 'enzyme';

import { pdfjs } from '../entry.jest';

import { TextLayerInternal as TextLayer } from './TextLayer';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

describe('TextLayer', () => {
  // Loaded page
  let page;
  let page2;

  // Loaded page text items
  let desiredTextItems;
  let desiredTextItems2;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    desiredTextItems = textContent.items;

    page2 = await pdf.getPage(2);
    const textContent2 = await page2.getTextContent();
    desiredTextItems2 = textContent2.items;
  });

  describe('loading', () => {
    it('loads text content and calls onGetTextSuccess callback properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      mount(<TextLayer onGetTextSuccess={onGetTextSuccess} page={page} />);

      expect.assertions(1);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject({ items: desiredTextItems });
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      mount(<TextLayer onGetTextError={onGetTextError} page={failingPage} />);

      expect.assertions(1);
      await expect(onGetTextErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const mountedComponent = mount(<TextLayer onGetTextSuccess={onGetTextSuccess} page={page} />);

      expect.assertions(2);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject({
        items: desiredTextItems,
      });

      const { func: onGetTextSuccess2, promise: onGetTextSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({
        onGetTextSuccess: onGetTextSuccess2,
        page: page2,
      });

      await expect(onGetTextSuccessPromise2).resolves.toMatchObject({
        items: desiredTextItems2,
      });
    });

    it('throws an error when placed outside Page', () => {
      muteConsole();
      expect(() => shallow(<TextLayer />)).toThrow();
      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders text content properly', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const component = mount(
        <TextLayer onRenderTextLayerSuccess={onRenderTextLayerSuccess} page={page} />,
      );

      expect.assertions(1);
      return onRenderTextLayerSuccessPromise.then(() => {
        const textItems = component.getDOMNode().children;

        expect(textItems).toHaveLength(desiredTextItems.length);
      });
    });

    it('calls customTextRenderer with necessary arguments', () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = jest.fn();

      mount(
        <TextLayer
          customTextRenderer={customTextRenderer}
          onRenderTextLayerSuccess={onRenderTextLayerSuccess}
          page={page}
        />,
      );

      expect.assertions(2);
      return onRenderTextLayerSuccessPromise.then(() => {
        expect(customTextRenderer).toHaveBeenCalledTimes(desiredTextItems.length);
        expect(customTextRenderer).toHaveBeenCalledWith(
          expect.objectContaining({
            str: expect.any(String),
            itemIndex: expect.any(Number),
          }),
        );
      });
    });

    it('renders text content properly given customTextRenderer', () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = () => 'Test value';

      const component = mount(
        <TextLayer
          customTextRenderer={customTextRenderer}
          onRenderTextLayerSuccess={onRenderTextLayerSuccess}
          page={page}
        />,
      );

      expect.assertions(1);
      return onRenderTextLayerSuccessPromise.then(() => {
        const textItem = component.text();
        expect(textItem).toContain('Test value');
      });
    });
  });
});
