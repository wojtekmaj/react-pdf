import React from 'react';
import { render } from '@testing-library/react';

import { pdfjs } from '../entry.jest';

import { PageCanvasInternal as PageCanvas } from './PageCanvas';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

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
        cancel: () => {},
      }),
    });
  });

  describe('loading', () => {
    it('renders a page and calls onRenderSuccess callback properly', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      muteConsole();

      render(
        <PageCanvas onRenderSuccess={onRenderSuccess} page={pageWithRendererMocked} scale={1} />,
      );

      expect.assertions(1);

      await expect(onRenderSuccessPromise).resolves.toMatchObject({});

      restoreConsole();
    });

    it('calls onRenderError when failed to render canvas', async () => {
      const { func: onRenderError, promise: onRenderErrorPromise } = makeAsyncCallback();

      muteConsole();

      render(<PageCanvas onRenderError={onRenderError} page={failingPage} scale={1} />);

      expect.assertions(1);

      await expect(onRenderErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('passes canvas element to canvasRef properly', () => {
      const canvasRef = jest.fn();

      render(<PageCanvas canvasRef={canvasRef} page={page} scale={1} />);

      expect(canvasRef).toHaveBeenCalled();
      expect(canvasRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });
  });
});
