import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page as browserPage } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ErrorBoundary } from 'react-error-boundary';

import { pdfjs } from './index.test.js';
import PageContext from './PageContext.js';
import StructTree from './StructTree.js';

import failingPage from '../../../__mocks__/_failing_page.js';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../test-utils.js';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { StructTreeNode } from 'pdfjs-dist/types/src/display/api.js';
import type { FallbackProps } from 'react-error-boundary';
import type { PageContextType } from './shared/types.js';

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');

async function renderWithContext(children: React.ReactNode, context: Partial<PageContextType>) {
  const { rerender, ...otherResult } = await render(
    <PageContext.Provider value={{ suspense: false, ...context } as PageContextType}>
      {children}
    </PageContext.Provider>,
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

function renderError({ error }: FallbackProps): React.ReactNode {
  return <div role="alert">{error instanceof Error ? error.message : String(error)}</div>;
}

describe('StructTree', () => {
  // Loaded page
  let page: PDFPageProxy;
  let page2: PDFPageProxy;

  // Loaded structure tree
  let desiredStructTree: StructTreeNode;
  let desiredStructTree2: StructTreeNode;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
    desiredStructTree = await page.getStructTree();

    page2 = await pdf.getPage(2);
    desiredStructTree2 = await page2.getStructTree();
  });

  describe('loading', () => {
    it('loads structure tree and calls onGetStructTreeSuccess callback properly', async () => {
      const { func: onGetStructTreeSuccess, promise: onGetStructTreeSuccessPromise } =
        makeAsyncCallback();

      await renderWithContext(<StructTree />, {
        onGetStructTreeSuccess,
        page,
      });

      expect.assertions(1);

      await expect(onGetStructTreeSuccessPromise).resolves.toMatchObject([desiredStructTree]);
    });

    it('calls onGetStructTreeError when failed to load annotations', async () => {
      const { func: onGetStructTreeError, promise: onGetStructTreeErrorPromise } =
        makeAsyncCallback();

      muteConsole();

      await renderWithContext(<StructTree />, {
        onGetStructTreeError,
        page: failingPage,
      });

      expect.assertions(1);

      await expect(onGetStructTreeErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces structure tree properly when page is changed', async () => {
      const { func: onGetStructTreeSuccess, promise: onGetStructTreeSuccessPromise } =
        makeAsyncCallback();

      const { rerender } = await renderWithContext(<StructTree />, {
        onGetStructTreeSuccess,
        page,
      });

      expect.assertions(2);

      await expect(onGetStructTreeSuccessPromise).resolves.toMatchObject([desiredStructTree]);

      const { func: onGetStructTreeSuccess2, promise: onGetStructTreeSuccessPromise2 } =
        makeAsyncCallback();

      await rerender(<StructTree />, {
        onGetStructTreeSuccess: onGetStructTreeSuccess2,
        page: page2,
      });

      await expect(onGetStructTreeSuccessPromise2).resolves.toMatchObject([desiredStructTree2]);
    });

    it('throws an error when placed outside Page', async () => {
      muteConsole();

      await expect(render(<StructTree />)).rejects.toThrowError(
        'Invariant failed: Unable to find Page context.',
      );

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders structure tree properly', async () => {
      const { func: onGetStructTreeSuccess, promise: onGetStructTreeSuccessPromise } =
        makeAsyncCallback();

      const { container } = await renderWithContext(<StructTree />, {
        onGetStructTreeSuccess,
        page,
      });

      expect.assertions(1);

      await onGetStructTreeSuccessPromise;

      const wrapper = container.firstElementChild as HTMLSpanElement;

      expect(wrapper.outerHTML).toBe(
        '<span class="react-pdf__Page__structTree structTree"><span><span role="heading" aria-level="1" aria-owns="p3R_mc0"></span><span aria-owns="p3R_mc1"></span><span aria-owns="p3R_mc2"></span><span role="figure" aria-owns="p3R_mc12"></span><span aria-owns="p3R_mc3"></span><span aria-owns="p3R_mc4"></span><span role="heading" aria-level="2" aria-owns="p3R_mc5"></span><span aria-owns="p3R_mc6"></span><span><span aria-owns="p3R_mc7"></span><span role="link"><span aria-owns="pdfjs_internal_id_13R"></span><span aria-owns="p3R_mc8"></span></span><span aria-owns="p3R_mc9"></span></span><span aria-owns="p3R_mc10"></span><span aria-owns="p3R_mc11"></span></span></span>',
      );
    });
  });

  describe('Suspense', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('reports an existing load error when Suspense is enabled without repeating the callback', async () => {
      const failure = new Error('StructTree failed');
      const onError = vi.fn();
      vi.spyOn(page, 'getStructTree').mockRejectedValue(failure);

      const children = (
        <ErrorBoundary fallbackRender={renderError}>
          <StructTree />
        </ErrorBoundary>
      );
      const context = {
        onGetStructTreeError: onError,
        page,
        rotate: 0,
        scale: 1,
        suspense: false,
      };

      const { rerender } = await renderWithContext(children, context);

      await expect.poll(() => onError).toHaveBeenCalledExactlyOnceWith(failure);

      await rerender(children, { ...context, suspense: true });

      await expect.element(browserPage.getByRole('alert')).toHaveTextContent(failure.message);
      expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
    });

    it('loads a replacement page when enabling Suspense after an error', async () => {
      const failure = new Error('StructTree failed');
      const onError = vi.fn();
      const onSuccess = vi.fn();
      vi.spyOn(page, 'getStructTree').mockRejectedValue(failure);

      const children = (
        <ErrorBoundary fallbackRender={renderError}>
          <StructTree />
        </ErrorBoundary>
      );
      const context = {
        onGetStructTreeError: onError,
        onGetStructTreeSuccess: onSuccess,
        page,
        suspense: false,
      };

      const { rerender } = await renderWithContext(children, context);

      await expect.poll(() => onError).toHaveBeenCalledExactlyOnceWith(failure);

      await rerender(children, { ...context, page: page2, suspense: true });

      await expect.poll(() => onSuccess).toHaveBeenCalledExactlyOnceWith(desiredStructTree2);
    });

    it('forwards asynchronous getStructTree failures to an Error Boundary', async () => {
      const failure = new Error('StructTree failed');
      const onError = vi.fn();
      vi.spyOn(page, 'getStructTree').mockRejectedValue(failure);

      await renderWithContext(
        <ErrorBoundary fallbackRender={renderError}>
          <StructTree />
        </ErrorBoundary>,
        {
          onGetStructTreeError: onError,
          page,
          rotate: 0,
          scale: 1,
          suspense: true,
        },
      );

      await expect.element(browserPage.getByRole('alert')).toHaveTextContent(failure.message);
      expect(onError).toHaveBeenCalledWith(failure);
    });
  });
});
