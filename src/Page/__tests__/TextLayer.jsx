import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import {} from '../../entry.noworker';
import TextLayer from '../TextLayer';

import failingPage from '../../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../__tests__/utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('TextLayer', () => {
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
        <TextLayer />,
        {
          context: {
            onGetTextSuccess,
            page,
          },
        },
      );

      expect.assertions(1);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);
    });

    it('calls onGetTextError when failed to load text content', async () => {
      const { func: onGetTextError, promise: onGetTextErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <TextLayer />,
        {
          context: {
            onGetTextError,
            page: failingPage,
          },
        },
      );

      expect.assertions(1);
      await expect(onGetTextErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces text content properly', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <TextLayer />,
        {
          context: {
            onGetTextSuccess,
            page,
          },
        },
      );

      expect.assertions(2);
      await expect(onGetTextSuccessPromise).resolves.toMatchObject(desiredTextItems);

      const { func: onGetTextSuccess2, promise: onGetTextSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setContext({
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
        <TextLayer />,
        {
          context: {
            onGetTextSuccess,
            page,
          },
        },
      );

      expect.assertions(1);
      return onGetTextSuccessPromise.then(() => {
        component.update();
        const textItems = component.children();

        expect(textItems).toHaveLength(desiredTextItems.length);
      });
    });

    it('renders text content at a given rotation', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();
      const rotate = 90;

      const component = shallow(
        <TextLayer />,
        {
          context: {
            onGetTextSuccess,
            page,
            rotate,
          },
        },
      );

      expect.assertions(1);
      return onGetTextSuccessPromise.then(() => {
        component.update();
        const { rotate: instanceRotate } = component.instance();

        expect(instanceRotate).toEqual(rotate);
      });
    });

    it('renders text content at a given scale', async () => {
      const { func: onGetTextSuccess, promise: onGetTextSuccessPromise } = makeAsyncCallback();
      const scale = 2;

      const component = shallow(
        <TextLayer />,
        {
          context: {
            onGetTextSuccess,
            page,
            scale,
          },
        },
      );

      expect.assertions(1);
      return onGetTextSuccessPromise.then(() => {
        component.update();
        const { unrotatedViewport: viewport } = component.instance();

        expect(viewport.scale).toEqual(scale);
      });
    });
  });
});
