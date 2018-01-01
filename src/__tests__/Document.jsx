import React from 'react';
import { mount } from 'enzyme';

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

const OK = Symbol('OK');

/* eslint-disable comma-dangle */

const makeAsyncCallback = (callbackValue) => {
  let promiseResolve;
  const promise = new Promise((resolve) => {
    promiseResolve = resolve;
  });
  const func = jest.fn(
    callbackValue ?
      () => promiseResolve(callbackValue) :
      promiseResolve
  );

  return { promise, func };
};

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


describe('Document', () => {
  describe('loading', () => {
    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      mount(
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

      mount(
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

      mount(
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

      mount(
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

      mount(
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

      const mountedComponent = mount(
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
    it('renders "No PDF file specified." when given nothing', () => {
      const component = mount(
        <Document />
      );

      const noData = component.find('.ReactPDF__NoData');

      expect(noData.text()).toBe('No PDF file specified.');
    });

    it('renders custom no data message when given nothing and noData prop is specified', () => {
      const component = mount(
        <Document noData="Nothing here" />
      );

      const noData = component.find('.ReactPDF__NoData');

      expect(noData.text()).toBe('Nothing here');
    });
  });
});
