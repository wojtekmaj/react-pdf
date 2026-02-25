import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { pdfjs } from '../index.test.js';
import PageContext from '../PageContext.js';
import TextLayer from './TextLayer.js';

import failingPage from '../../../../__mocks__/_failing_page.js';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../../test-utils.js';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { TextContent } from 'pdfjs-dist/types/src/display/api.js';
import type { CustomTextRenderer, PageContextType } from '../shared/types.js';

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');
const untaggedPdfFile = await loadPDF('../../__mocks__/_untagged.pdf');

async function renderWithContext(children: React.ReactNode, context: Partial<PageContextType>) {
  const { rerender, ...otherResult } = await render(
    <PageContext.Provider value={context as PageContextType}>{children}</PageContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: async (
      nextChildren: React.ReactNode,
      nextContext: Partial<PageContextType> = context,
    ) =>
      await rerender(
        <PageContext.Provider value={nextContext as PageContextType}>
          {nextChildren}
        </PageContext.Provider>,
      ),
  };
}

function getTextItems(container: HTMLElement) {
  const wrapper = container.firstElementChild as HTMLDivElement;

  return wrapper.querySelectorAll('[role="presentation"]');
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

      await renderWithContext(<TextLayer />, {
        onGetTextSuccess,
        page,
      });

      expect.assertions(1);

      await expect(onGetTextSuccessPromise).resolves.toMatchObject([{ items: desiredTextItems }]);
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      await renderWithContext(<TextLayer />, {
        onGetTextError,
        page: failingPage,
      });

      expect.assertions(1);

      await expect(onGetTextErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const { rerender } = await renderWithContext(<TextLayer />, {
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

      await rerender(<TextLayer />, {
        onGetTextSuccess: onGetTextSuccess2,
        page: page2,
      });

      await expect(onGetTextSuccessPromise2).resolves.toMatchObject([
        {
          items: desiredTextItems2,
        },
      ]);
    });

    it('throws an error when placed outside Page', async () => {
      muteConsole();

      await expect(render(<TextLayer />)).rejects.toThrowError(
        'Invariant failed: Unable to find Page context.',
      );

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders text content properly', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const { container } = await renderWithContext(<TextLayer />, {
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      expect(textItems).toHaveLength(desiredTextItems.length);
    });

    it('renders text content properly given customTextRenderer', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer = vi.fn();

      const { container } = await renderWithContext(<TextLayer />, {
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

      const { container, rerender } = await renderWithContext(<TextLayer />, {
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      const textItems = getTextItems(container);

      const { func: onRenderTextLayerSuccess2, promise: onRenderTextLayerSuccessPromise2 } =
        makeAsyncCallback();

      const customTextRenderer: CustomTextRenderer = ({ str }: { str: string }) => str;

      await rerender(<TextLayer />, {
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

      const { container } = await renderWithContext(<TextLayer />, {
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

      const { container } = await renderWithContext(<TextLayer />, {
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

      const { container } = await renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page: untaggedPage,
      });

      expect.assertions(1);

      await onRenderTextLayerSuccessPromise;

      expect(container).toHaveTextContent('Test value');
    });

    it('renders HTML formatting from customTextRenderer output', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer: CustomTextRenderer = ({ str }: { str: string }) =>
        str.replace(/ipsum/g, '<mark>ipsum</mark>');

      const { container } = await renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(2);

      await onRenderTextLayerSuccessPromise;

      const highlightedText = container.querySelectorAll('mark');

      expect(highlightedText.length).toBeGreaterThan(0);
      expect(highlightedText[0]).toHaveTextContent('ipsum');
    });

    it('does not render blocked tags from customTextRenderer output', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const windowWithBlockedTagFlag = window as typeof window & {
        __reactPdfBlockedTagExecuted?: boolean;
      };
      windowWithBlockedTagFlag.__reactPdfBlockedTagExecuted = false;

      const customTextRenderer: CustomTextRenderer = () =>
        '<script>window.__reactPdfBlockedTagExecuted = true</script><mark>safe</mark>';

      const { container } = await renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(3);

      await onRenderTextLayerSuccessPromise;

      expect(container.querySelector('script')).not.toBeInTheDocument();
      expect(windowWithBlockedTagFlag.__reactPdfBlockedTagExecuted).toBe(false);
      expect(container.querySelector('mark')).toHaveTextContent('safe');

      delete windowWithBlockedTagFlag.__reactPdfBlockedTagExecuted;
    });

    it('does not execute scripts from customTextRenderer output', async () => {
      const { func: onRenderTextLayerSuccess, promise: onRenderTextLayerSuccessPromise } =
        makeAsyncCallback();

      const customTextRenderer: CustomTextRenderer = () =>
        'javascript:/*--></title></style></textarea></script></xmp><details open ontoggle=alert(1)>x</details>';

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {
        // Intentionally empty
      });

      const { container } = await renderWithContext(<TextLayer />, {
        customTextRenderer,
        onRenderTextLayerSuccess,
        page,
      });

      expect.assertions(2);

      await onRenderTextLayerSuccessPromise;

      const detailsElement = container.querySelector('details');
      detailsElement?.dispatchEvent(new Event('toggle', { bubbles: true }));

      expect(detailsElement).not.toHaveAttribute('ontoggle');
      expect(alertSpy).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });
});
