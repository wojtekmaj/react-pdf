import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { pdfjs } from '../index.test.js';
import PageContext from '../PageContext.js';
import Canvas from './Canvas.js';

import failingPage from '../../../../__mocks__/_failing_page.js';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../../test-utils.js';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { PageContextType } from '../shared/types.js';

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');

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

describe('Canvas', () => {
  // Loaded page
  let page: PDFPageProxy;
  let pageWithRendererMocked: PDFPageProxy;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);

    pageWithRendererMocked = Object.assign(page, {
      render: () => ({
        promise: new Promise<void>((resolve) => resolve()),
        cancel: () => {
          // Intentionally empty
        },
      }),
    });
  });

  describe('loading', () => {
    it('renders a page and calls onRenderSuccess callback properly', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      muteConsole();

      await renderWithContext(<Canvas />, {
        onRenderSuccess,
        page: pageWithRendererMocked,
        scale: 1,
      });

      expect.assertions(1);

      await expect(onRenderSuccessPromise).resolves.toMatchObject([{}]);

      restoreConsole();
    });

    it('calls onRenderError when failed to render canvas', async () => {
      const { func: onRenderError, promise: onRenderErrorPromise } = makeAsyncCallback();

      muteConsole();

      await renderWithContext(<Canvas />, {
        onRenderError,
        page: failingPage,
        scale: 1,
      });

      expect.assertions(1);

      await expect(onRenderErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('passes canvas element to canvasRef properly', async () => {
      const canvasRef = vi.fn();

      await renderWithContext(<Canvas canvasRef={canvasRef} />, {
        page: pageWithRendererMocked,
        scale: 1,
      });

      expect(canvasRef).toHaveBeenCalled();
      expect(canvasRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('does not request structure tree to be rendered when renderTextLayer = false', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      const { container } = await renderWithContext(<Canvas />, {
        onRenderSuccess,
        page: pageWithRendererMocked,
        renderTextLayer: false,
      });

      await onRenderSuccessPromise;

      const structTree = container.querySelector('.react-pdf__Page__structTree');

      expect(structTree).not.toBeInTheDocument();
    });

    it('renders StructTree when given renderTextLayer = true', async () => {
      const { func: onGetStructTreeSuccess, promise: onGetStructTreeSuccessPromise } =
        makeAsyncCallback();

      const { container } = await renderWithContext(<Canvas />, {
        onGetStructTreeSuccess,
        page: pageWithRendererMocked,
        renderTextLayer: true,
      });

      expect.assertions(1);

      await onGetStructTreeSuccessPromise;

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      expect(canvas.children.length).toBeGreaterThan(0);
    });
  });
});
