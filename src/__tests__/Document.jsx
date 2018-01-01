import React from 'react';
import { shallow } from 'enzyme';

import { Document } from '../entry.noworker';

import {
  fileArrayBuffer,
  fileBlob,
  fileFile,
  fileDataURI,
} from '../../__mocks__/_pdf.buffer';

import {
  fileFile as fileFile2,
} from '../../__mocks__/_pdf2.buffer';

import { makeAsyncCallback } from './utils';

const OK = Symbol('OK');

const desiredLoadedPdf = {
  loadingTask: {},
  pdfInfo: {
    fingerprint: 'a62067476e69734bb8eb60122615dfbf',
    numPages: 4,
  },
  transport: {},
};
const desiredLoadedPdf2 = {
  loadingTask: {},
  pdfInfo: {
    fingerprint: '04d9eadd32916d728460daa283b37ff2',
    numPages: 5,
  },
  transport: {},
};

/* eslint-disable comma-dangle */

describe('Document', () => {
  describe('loading', () => {
    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={fileDataURI}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly (param object)', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={{ url: fileDataURI }}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via ArrayBuffer properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={fileArrayBuffer}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via Blob properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={fileBlob}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via File properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={fileFile}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('replaces a file properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <Document
          file={fileFile}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(4);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);

      const { func: onSourceSuccess2, promise: onSourceSuccessPromise2 } = makeAsyncCallback(OK);
      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({
        file: fileFile2,
        onLoadSuccess: onLoadSuccess2,
        onSourceSuccess: onSourceSuccess2,
      });

      await expect(onSourceSuccessPromise2).resolves.toBe(OK);
      await expect(onLoadSuccessPromise2).resolves.toMatchObject(desiredLoadedPdf2);
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', () => {
      const className = 'testClassName';

      const component = shallow(
        <Document className={className} />
      );

      const wrapperClassName = component.find('.react-pdf__Document').prop('className');

      expect(wrapperClassName.includes(className)).toBe(true);
    });

    it('renders "No PDF file specified." when given nothing', () => {
      const component = shallow(
        <Document />
      );

      const noData = component.find('.react-pdf__message--no-data');

      expect(noData).toHaveLength(1);
      expect(noData.text()).toBe('No PDF file specified.');
    });

    it('renders custom no data message when given nothing and noData prop is specified', () => {
      const component = shallow(
        <Document noData="Nothing here" />
      );

      const noData = component.find('.react-pdf__message--no-data');

      expect(noData).toHaveLength(1);
      expect(noData.text()).toBe('Nothing here');
    });

    it('renders "Loading PDF…" when loading a file', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={fileFile}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        const loading = component.find('.react-pdf__message--loading');

        expect(loading).toHaveLength(1);
        expect(loading.text()).toBe('Loading PDF…');
      });
    });

    it('renders custom loading message when given nothing and loading prop is specified', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={fileFile}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        const loading = component.find('.react-pdf__message--loading');

        expect(loading).toHaveLength(1);
        expect(loading.text()).toBe('Loading');
      });
    });
  });
});
