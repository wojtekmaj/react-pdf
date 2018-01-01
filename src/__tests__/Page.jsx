import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import { Page } from '../entry.noworker';

import { fileArrayBuffer } from '../../__mocks__/_pdf.buffer';

import { makeAsyncCallback } from './utils';

const { PDFJS } = pdfjs;

const desiredLoadedPage = {
  pageIndex: 0,
  pageInfo: {
    rotate: 0,
  },
};

const registerPageCallback = [
  desiredLoadedPage.pageIndex,
  undefined, // Page reference is not defined in Enzyme
];

/* eslint-disable comma-dangle */

describe('Page', async () => {
  let pdf;

  beforeAll(async () => {
    pdf = await PDFJS.getDocument({ data: fileArrayBuffer });
  });

  describe('loading', () => {
    it('loads a page and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Page
          pageIndex={0}
          pdf={pdf}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);
    });

    it('calls registerPage when loaded a page', async () => {
      const { func: registerPage, promise: registerPagePromise } = makeAsyncCallback();

      shallow(
        <Page
          pageIndex={0}
          pdf={pdf}
          registerPage={registerPage}
        />
      );

      expect.assertions(1);
      await expect(registerPagePromise).resolves.toMatchObject(registerPageCallback);
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', () => {
      const className = 'testClassName';

      const component = shallow(
        <Page
          className={className}
          pageIndex={0}
          pdf={pdf}
        />
      );

      const wrapperClassName = component.find('.react-pdf__Page').prop('className');

      expect(wrapperClassName.includes(className)).toBe(true);
    });
  });
});
