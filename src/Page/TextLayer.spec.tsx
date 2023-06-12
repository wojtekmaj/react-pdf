import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { pdfjs } from '../index.test';

import TextLayer from './TextLayer';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

import PageContext from '../PageContext';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { TextContent } from 'pdfjs-dist/types/src/display/api';
import type { PageContextType } from '../shared/types';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const untaggedPdfFile = loadPDF('./__mocks__/_untagged.pdf');

function renderWithContext(children: React.ReactNode, context: Partial<PageContextType>) {
  const { rerender, ...otherResult } = render(
    <PageContext.Provider value={context as PageContextType}>{children}</PageContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (nextChildren: React.ReactNode, nextContext: Partial<PageContextType> = context) =>
      rerender(
        <PageContext.Provider value={nextContext as PageContextType}>
          {nextChildren}
        </PageContext.Provider>,
      ),
  };
}

function getTextItems(container: HTMLElement) {
  const wrapper = container.firstElementChild as HTMLDivElement;

  return wrapper.querySelectorAll('.markedContent > *:not(.markedContent');
}

describe('TextLayer', () => {
  // Loaded page
  let page: PDFPageProxy;
  let page2: PDFPageProxy;

  // Loaded page text items
  let desiredTextItems: TextContent['items'];
  let desiredTextItems2: TextContent['items'];

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

      renderWithContext(<TextLayer />, {
        onGetTextSuccess,
        page,
      });

      expect.assertions(1);

      await expect(onGetTextSuccessPromise).resolves.toMatchObject([{ items: desiredTextItems }]);
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      renderWithContext(<TextLayer />, {
        onGetTextError,
        page: failingPage,
      });

      expect.assertions(1);

      await expect(onGetTextErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(<TextLayer />, {
        onGetTextSuccess,
        page,
      });

      expect.assertions(2);

      await expect(onGetTextSuccessPromise).resolves.toMatchObject([
        {
          items: desiredTextItems,
        },
      ]);

      const { func: onGetTextSuccess2, promise: onGetTextSuccessPromise2 } = makeAsyncCallback();

      rerender(<TextLayer />, {
        onGetTextSuccess: onGetTextSuccess2,
        page: page2,
      });

      await expect(onGetTextSuccessPromise2).resolves.toMatchObject([
        {
          items: desiredTextItems2,
        },
      ]);
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

      const { container } = renderWithContext(<TextLayer />, { onRenderTextLayerSuccess, page });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      expect(textItems).toHaveLength(desiredTextItems.length);
    });

    it('renders text content properly given customTextRenderer', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = vi.fn();

      const { container } = renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      expect(textItems).toHaveLength(desiredTextItems.length);
    });

    it('maps textContent items to actual TextLayer children properly', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const { container, rerender } = renderWithContext(<TextLayer />, {
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      const { func: onRenderTextLayerSuccess2, promise: onRenderTextLayerSuccessPromise2 } =
        makeAsyncCallback();

      const customTextRenderer = (item: { str: string }) => item.str;

      rerender(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess: onRenderTextLayerSuccess2,
        page,
      });

      await onRenderTextLayerSuccessPromise2;

      const textItems2 = getTextItems(container);

      expect(textItems).toEqual(textItems2);
    });

    it('calls customTextRenderer with necessary arguments', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = vi.fn();

      const { container } = renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(3);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      expect(textItems).toHaveLength(desiredTextItems.length);

      expect(customTextRenderer).toHaveBeenCalledTimes(desiredTextItems.length);
      expect(customTextRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          str: expect.any(String),
          itemIndex: expect.any(Number),
        }),
      );
    });

    it('renders text content properly given customTextRenderer', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = () => 'Test value';

      const { container } = renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      expect(container).toHaveTextContent('Test value');
    });

    it('renders text content properly given customTextRenderer and untagged document', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = () => 'Test value';

      const untaggedDoc = await pdfjs.getDocument({ data: untaggedPdfFile.arrayBuffer }).promise;
      const untaggedPage = await untaggedDoc.getPage(1);

      const { container } = renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page: untaggedPage,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      expect(container).toHaveTextContent('Test value');
    });
  });
});
