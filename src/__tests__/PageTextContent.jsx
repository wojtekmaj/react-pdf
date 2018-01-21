import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import {} from '../entry.noworker';
import PageTextContent from '../PageTextContent';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from './utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('PageTextContent', () => {
  // Loaded page
  let page;
  let page2;

  // Loaded page text items
  let desiredTextItems;
  let desiredTextItems2;

  beforeAll(async () => {
    const pdf = await PDFJS.getDocument({ data: fileArrayBuffer });

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

      shallow(
        <PageTextContent
          onGetTextSuccess={onGetTextSuccess}
          page={page}
        />
      );

      expect.assertions(1);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <PageTextContent
          onGetTextError={onGetTextError}
          page={failingPage}
        />
      );

      expect.assertions(1);
      await expect(onGetTextErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <PageTextContent
          onGetTextSuccess={onGetTextSuccess}
          page={page}
        />
      );

      expect.assertions(2);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);

      const { func: onGetTextSuccess2, promise: onGetTextSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({
        onGetTextSuccess: onGetTextSuccess2,
        page: page2,
      });

      await expect(onGetTextSuccessPromise2).resolves.toMatchObject(desiredTextItems2);
    });
  });

  describe('rendering', () => {
    it('renders text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <PageTextContent
          onGetTextSuccess={onGetTextSuccess}
          page={page}
        />
      );

      expect.assertions(2);
      return onGetTextSuccessPromise.then(() => {
        component.update();
        const textItems = component.children();

        expect(textItems).toHaveLength(desiredTextItems.length);
        expect(textItems.map(item => item.text())).toEqual(desiredTextItems.map(item => item.str));
      });
    });
  });
});
