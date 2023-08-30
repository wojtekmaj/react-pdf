import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { pdfjs } from '../index.test.js';

import PageCanvas from './PageCanvas.js';

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

describe('PageCanvas', () => {
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

      renderWithContext(<PageCanvas />, {
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

      renderWithContext(<PageCanvas />, {
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
    it('passes canvas element to canvasRef properly', () => {
      const canvasRef = vi.fn();

      renderWithContext(<PageCanvas canvasRef={canvasRef} />, {
        page: pageWithRendererMocked,
        scale: 1,
      });

      expect(canvasRef).toHaveBeenCalled();
      expect(canvasRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('does not request structure tree to be rendered when renderTextLayer = false', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(<PageCanvas />, {
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

      const { container } = renderWithContext(<PageCanvas />, {
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
