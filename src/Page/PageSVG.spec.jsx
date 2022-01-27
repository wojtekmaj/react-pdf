import React from 'react';
import { mount } from 'enzyme';

import { pdfjs } from '../entry.jest';

import { PageSVGInternal as PageSVG } from './PageSVG';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

describe('PageSVG', () => {
  // Loaded page
  let page;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
  });

  describe('loading', () => {
    it('renders a page and calls onRenderSuccess callback properly', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } = makeAsyncCallback();

      muteConsole();

      mount(<PageSVG onRenderSuccess={onRenderSuccess} page={page} scale={1} />);

      expect.assertions(1);

      await expect(onRenderSuccessPromise).resolves.toMatchObject({});

      restoreConsole();
    });

    it('calls onRenderError when failed to render canvas', async () => {
      const { func: onRenderError, promise: onRenderErrorPromise } = makeAsyncCallback();

      muteConsole();

      mount(<PageSVG onRenderError={onRenderError} page={failingPage} scale={1} />);

      expect.assertions(1);

      await expect(onRenderErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });
  });
});
