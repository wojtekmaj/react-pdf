import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';

import { Document } from '../entry.noworker';

import { makeAsyncCallback, loadPDF, muteConsole, restoreConsole } from './utils';

const {
  arrayBuffer: fileArrayBuffer,
  blob: fileBlob,
  file: fileFile,
  dataURI: fileDataURI,
} = loadPDF('./__mocks__/_pdf.pdf');

const {
  arrayBuffer: fileArrayBuffer2,
  file: fileFile2,
} = loadPDF('./__mocks__/_pdf2.pdf');

const OK = Symbol('OK');

/* eslint-disable comma-dangle */

const Child = () => <div className="Child" />;

Child.contextTypes = {
  pdf: PropTypes.any,
};

describe('Document', () => {
  // Object with basic loaded PDF information that shall match after successful loading
  const desiredLoadedPdf = {};
  const desiredLoadedPdf2 = {};

  beforeAll(async () => {
    const pdf = await PDFJS.getDocument({ data: fileArrayBuffer });
    desiredLoadedPdf.pdfInfo = pdf.pdfInfo;

    const pdf2 = await PDFJS.getDocument({ data: fileArrayBuffer2 });
    desiredLoadedPdf2.pdfInfo = pdf2.pdfInfo;
  });

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

    it('passes container element to inputRef properly', () => {
      const inputRef = jest.fn();

      mount(
        <Document inputRef={inputRef} />
      );

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
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

    it('renders custom loading message when loading a file and loading prop is specified', () => {
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

    it('renders "Failed to load PDF file." when failed to load a document', () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const component = shallow(
        <Document
          file={failingPdf}
          onLoadError={onLoadError}
        />
      );

      expect.assertions(2);
      return onLoadErrorPromise.then(() => {
        component.update();
        const error = component.find('.react-pdf__message--error');

        expect(error).toHaveLength(1);
        expect(error.text()).toBe('Failed to load PDF file.');

        restoreConsole();
      });
    });

    it('renders custom error message when failed to load a document', () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();
      const failingPdf = 'data:application/pdf;base64,abcdef';

      muteConsole();

      const component = shallow(
        <Document
          file={failingPdf}
          error="Error"
          onLoadError={onLoadError}
        />
      );

      expect.assertions(2);
      return onLoadErrorPromise.then(() => {
        component.update();
        const error = component.find('.react-pdf__message--error');

        expect(error).toHaveLength(1);
        expect(error.text()).toBe('Error');

        restoreConsole();
      });
    });

    it('passes rotate prop to its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={fileFile}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          rotate={90}
        >
          <Child />
        </Document>
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        expect(component.instance().getChildContext().rotate).toBe(90);
      });
    });

    it('does not overwrite rotate prop in its children when given rotate prop to both Document and its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={fileFile}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          rotate={90}
        >
          <Child rotate={180} />
        </Document>
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const child = component.find('Child');
        expect(child.prop('rotate')).toBe(180);
      });
    });
  });
});
