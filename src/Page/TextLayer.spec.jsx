import React from 'react';
import { render } from '@testing-library/react';

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

      render(<TextLayer onGetTextSuccess={onGetTextSuccess} page={page} />);

      expect.assertions(1);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject({ items: desiredTextItems });
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      render(<TextLayer onGetTextError={onGetTextError} page={failingPage} />);

      expect.assertions(1);
      await expect(onGetTextErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const { rerender } = render(<TextLayer onGetTextSuccess={onGetTextSuccess} page={page} />);

      expect.assertions(2);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject({
        items: desiredTextItems,
      });

      const { func: onGetTextSuccess2, promise: onGetTextSuccessPromise2 } = makeAsyncCallback();

      rerender(<TextLayer onGetTextSuccess={onGetTextSuccess2} page={page2} />);

      await expect(onGetTextSuccessPromise2).resolves.toMatchObject({
        items: desiredTextItems2,
      });
    });

    it('throws an error when placed outside Page', () => {
      muteConsole();
      expect(() => render(<TextLayer />)).toThrow();
      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders text content properly', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const { container } = render(
        <TextLayer onRenderTextLayerSuccess={onRenderTextLayerSuccess} page={page} />,
      );

      expect.assertions(1);
      return onRenderTextLayerSuccessPromise.then(() => {
        const textItems = [...container.firstChild.children];

        expect(textItems).toHaveLength(desiredTextItems.length);
      });
    });

    it('calls customTextRenderer with necessary arguments', () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = jest.fn();

      render(
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

      const { container } = render(
        <TextLayer
          customTextRenderer={customTextRenderer}
          onRenderTextLayerSuccess={onRenderTextLayerSuccess}
          page={page}
        />,
      );

      expect.assertions(1);
      return onRenderTextLayerSuccessPromise.then(() => {
        expect(container).toHaveTextContent('Test value');
      });
    });
  });
});
