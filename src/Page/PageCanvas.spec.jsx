import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import { pdfjs } from '../index.test';

import PageCanvas from './PageCanvas';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

import PageContext from '../PageContext';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

function renderWithContext(children, context) {
  const { rerender, ...otherResult } = render(
    <PageContext.Provider value={context}>{children}</PageContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (nextChildren, nextContext = context) =>
      rerender(<PageContext.Provider value={nextContext}>{nextChildren}</PageContext.Provider>),
  };
}

describe('PageCanvas', () => {
  // Loaded page
  let page;
  let pageWithRendererMocked;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);

    pageWithRendererMocked = Object.assign(page, {
      render: () => ({
        promise: new Promise((resolve) => resolve()),
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
  });
});
