import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import {} from '../entry.noworker';
import PageAnnotations from '../PageAnnotations';

import failingPage from '../../__mocks__/_failing_page';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from './utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('PageAnnotations', () => {
  // Loaded page
  let page;
  let page2;

  // Loaded page text items
  let desiredAnnotations;
  let desiredAnnotations2;

  beforeAll(async () => {
    const pdf = await PDFJS.getDocument({ data: fileArrayBuffer });

    page = await pdf.getPage(1);
    desiredAnnotations = await page.getAnnotations();

    page2 = await pdf.getPage(2);
    desiredAnnotations2 = await page2.getAnnotations();
  });

  describe('loading', () => {
    it('loads annotations and calls onGetAnnotationsSuccess callback properly', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise
      } = makeAsyncCallback();

      shallow(
        <PageAnnotations
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />
      );

      expect.assertions(1);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);
    });

    it('calls onGetAnnotationsError when failed to load annotations', async () => {
      const {
        func: onGetAnnotationsError, promise: onGetAnnotationsErrorPromise
      } = makeAsyncCallback();

      muteConsole();

      shallow(
        <PageAnnotations
          onGetAnnotationsError={onGetAnnotationsError}
          page={failingPage}
        />
      );

      expect.assertions(1);
      await expect(onGetAnnotationsErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces annotations properly', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise
      } = makeAsyncCallback();

      const mountedComponent = shallow(
        <PageAnnotations
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />
      );

      expect.assertions(2);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);

      const {
        func: onGetAnnotationsSuccess2, promise: onGetAnnotationsSuccessPromise2
      } = makeAsyncCallback();

      mountedComponent.setProps({
        onGetAnnotationsSuccess: onGetAnnotationsSuccess2,
        page: page2,
      });

      await expect(onGetAnnotationsSuccessPromise2).resolves.toMatchObject(desiredAnnotations2);
    });
  });
});
