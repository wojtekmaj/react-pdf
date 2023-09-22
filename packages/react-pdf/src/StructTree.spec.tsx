import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { pdfjs } from './index.test.js';

import StructTree from './StructTree.js';

import failingPage from '../../../__mocks__/_failing_page.js';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../test-utils.js';

import PageContext from './PageContext.js';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { PageContextType } from './shared/types.js';
import { StructTreeNode } from 'pdfjs-dist/types/src/display/api.js';

const pdfFile = loadPDF('./../../__mocks__/_pdf.pdf');

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

      renderWithContext(<StructTree />, {
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

      renderWithContext(<StructTree />, {
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

      const { rerender } = renderWithContext(<StructTree />, {
        onGetStructTreeSuccess,
        page,
      });

      expect.assertions(2);

      await expect(onGetStructTreeSuccessPromise).resolves.toMatchObject([desiredStructTree]);

      const { func: onGetStructTreeSuccess2, promise: onGetStructTreeSuccessPromise2 } =
        makeAsyncCallback();

      rerender(<StructTree />, {
        onGetStructTreeSuccess: onGetStructTreeSuccess2,
        page: page2,
      });

      await expect(onGetStructTreeSuccessPromise2).resolves.toMatchObject([desiredStructTree2]);
    });

    it('throws an error when placed outside Page', () => {
      muteConsole();

      expect(() => render(<StructTree />)).toThrow();

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders structure tree properly', async () => {
      const { func: onGetStructTreeSuccess, promise: onGetStructTreeSuccessPromise } =
        makeAsyncCallback();

      const { container } = renderWithContext(<StructTree />, {
        onGetStructTreeSuccess,
        page,
      });

      expect.assertions(1);

      await onGetStructTreeSuccessPromise;

      const wrapper = container.firstElementChild as HTMLSpanElement;

      expect(wrapper.outerHTML).toBe(
        '<span class="react-pdf__Page__structTree structTree"><span><span role="heading" aria-level="1" aria-owns="p3R_mc0"></span><span aria-owns="p3R_mc1"></span><span aria-owns="p3R_mc2"></span><span role="figure" aria-owns="p3R_mc12"></span><span aria-owns="p3R_mc3"></span><span aria-owns="p3R_mc4"></span><span role="heading" aria-level="2" aria-owns="p3R_mc5"></span><span aria-owns="p3R_mc6"></span><span><span aria-owns="p3R_mc7"></span><span role="link"><span aria-owns="13R"></span><span aria-owns="p3R_mc8"></span></span><span aria-owns="p3R_mc9"></span></span><span aria-owns="p3R_mc10"></span><span aria-owns="p3R_mc11"></span></span></span>',
      );
    });
  });
});
