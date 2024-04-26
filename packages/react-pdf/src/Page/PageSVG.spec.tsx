import { Blob } from 'node:buffer';
import { beforeAll, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { pdfjs } from '../index.test.js';

import PageSVG from './PageSVG.js';

import failingPage from '../../../../__mocks__/_failing_page.js';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../../test-utils.js';

import PageContext from '../PageContext.js';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { PageContextType } from '../shared/types.js';

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

describe('PageSVG', () => {
  // Loaded page
  let page: PDFPageProxy;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
  });

  describe('loading', () => {
    it('renders a page and calls onRenderSuccess callback properly', async () => {
      const originalBlob = globalThis.Blob;
      globalThis.Blob = Blob as unknown as typeof globalThis.Blob;

      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      muteConsole();

      renderWithContext(<PageSVG />, {
        onRenderSuccess,
        page,
        scale: 1,
      });

      expect.assertions(1);

      await expect(onRenderSuccessPromise).resolves.toMatchObject([{}]);

      restoreConsole();

      globalThis.Blob = originalBlob;
    });

    it('calls onRenderError when failed to render canvas', async () => {
      const { func: onRenderError, promise: onRenderErrorPromise } = makeAsyncCallback();

      muteConsole();

      renderWithContext(<PageSVG />, {
        onRenderError,
        page: failingPage,
        scale: 1,
      });

      expect.assertions(1);

      await expect(onRenderErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });
  });
});
