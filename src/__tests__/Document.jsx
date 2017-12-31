import React from 'react';
import { mount } from 'enzyme';

import { Document } from '../entry.noworker';

import file from './_pdf.buffer';

const OK = Symbol('OK');

const fileArrayBuffer = file.buffer;
const fileBlob = new Blob([fileArrayBuffer], { type: 'application/pdf' });
const fileFile = new File([fileArrayBuffer], { type: 'application/pdf' });
const fileDataURI = `data:application/pdf;base64,${file.toString('base64')}`;

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

describe('Document', () => {
  it('renders "No PDF file specified." when given nothing', () => {
    const component = mount(
      <Document />
    );

    const noData = component.find('.ReactPDF__NoData');

    expect(noData.text()).toBe('No PDF file specified.');
  });

  it('renders custom no data message when given nothing', () => {
    const component = mount(
      <Document noData="Nothing here" />
    );

    const noData = component.find('.ReactPDF__NoData');

    expect(noData.text()).toBe('Nothing here');
  });

  it('loads a file via data URI properly', async () => {
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
    await expect(onLoadSuccessPromise).resolves.toBeInstanceOf(Object);
  });

  it('loads a file via data URI properly (param object)', async () => {
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
    await expect(onLoadSuccessPromise).resolves.toBeInstanceOf(Object);
  });

  it('loads a file via ArrayBuffer properly', async () => {
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
    await expect(onLoadSuccessPromise).resolves.toBeInstanceOf(Object);
  });

  it('loads a file via Blob properly', async () => {
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
    await expect(onLoadSuccessPromise).resolves.toBeInstanceOf(Object);
  });

  it('loads a file via File properly', async () => {
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
    await expect(onLoadSuccessPromise).resolves.toBeInstanceOf(Object);
  });
});
