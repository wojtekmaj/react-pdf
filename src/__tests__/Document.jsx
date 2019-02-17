import React from 'react';
import { mount, shallow } from 'enzyme';

import { pdfjs } from '../entry.jest';

import Document from '../Document';

import {
  makeAsyncCallback, loadPDF, muteConsole, restoreConsole,
} from './utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');

const OK = Symbol('OK');

/* eslint-disable comma-dangle */

const Child = () => <div className="Child" />;

describe('Document', () => {
  // Object with basic loaded PDF information that shall match after successful loading
  const desiredLoadedPdf = {};
  const desiredLoadedPdf2 = {};

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;
    desiredLoadedPdf._pdfInfo = pdf._pdfInfo;

    const pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;
    desiredLoadedPdf2._pdfInfo = pdf2._pdfInfo;
  });

  describe('loading', () => {
    it('loads a file and calls onSourceSuccess and onLoadSuccess callbacks via data URI properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Document
          file={pdfFile.dataURI}
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
          file={{ url: pdfFile.dataURI }}
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
          file={pdfFile.arrayBuffer}
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
          file={pdfFile.blob}
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
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
          onSourceSuccess={onSourceSuccess}
        />
      );

      expect.assertions(2);
      await expect(onSourceSuccessPromise).resolves.toBe(OK);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPdf);
    });

    it('fails to load a file and calls onSourceError given invalid file source', async () => {
      const { func: onSourceError, promise: onSourceErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <Document
          file={() => null}
          onSourceError={onSourceError}
        />
      );

      expect.assertions(1);
      return onSourceErrorPromise.then((error) => {
        expect(error).toMatchObject(expect.any(Error));

        restoreConsole();
      });
    });

    it('replaces a file properly', async () => {
      const { func: onSourceSuccess, promise: onSourceSuccessPromise } = makeAsyncCallback(OK);
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <Document
          file={pdfFile.file}
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
        file: pdfFile2.file,
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

      const noData = component.find('Message');

      expect(noData).toHaveLength(1);
      expect(noData.prop('children')).toBe('No PDF file specified.');
    });

    it('renders custom no data message when given nothing and noData prop is specified', () => {
      const component = shallow(
        <Document noData="Nothing here" />
      );

      const noData = component.find('Message');

      expect(noData).toHaveLength(1);
      expect(noData.prop('children')).toBe('Nothing here');
    });

    it('renders "Loading PDF…" when loading a file', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        // Since the pdf loads automatically, we need to simulate its loading state
        component.setState({ pdf: null });

        const loading = component.find('Message');

        expect(loading).toHaveLength(1);
        expect(loading.prop('children')).toBe('Loading PDF…');
      });
    });

    it('renders custom loading message when loading a file and loading prop is specified', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        // Since the pdf loads automatically, we need to simulate its loading state
        component.setState({ pdf: null });

        const loading = component.find('Message');

        expect(loading).toHaveLength(1);
        expect(loading.prop('children')).toBe('Loading');
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
        const error = component.find('Message');

        expect(error).toHaveLength(1);
        expect(error.prop('children')).toBe('Failed to load PDF file.');

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
        const error = component.find('Message');

        expect(error).toHaveLength(1);
        expect(error.prop('children')).toBe('Error');

        restoreConsole();
      });
    });

    it('passes renderMode prop to its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="svg"
        >
          <Child />
        </Document>
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        expect(component.instance().childContext.renderMode).toBe('svg');
      });
    });

    it('passes rotate prop to its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
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
        expect(component.instance().childContext.rotate).toBe(90);
      });
    });

    it('does not overwrite renderMode prop in its children when given renderMode prop to both Document and its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          renderMode="svg"
        >
          <Child renderMode="canvas" />
        </Document>
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const child = component.find('Child');
        expect(child.prop('renderMode')).toBe('canvas');
      });
    });

    it('does not overwrite rotate prop in its children when given rotate prop to both Document and its children', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
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

  describe('viewer', () => {
    it('calls onItemClick if defined', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const onItemClick = jest.fn();

      const component = shallow(
        <Document
          file={pdfFile.file}
          onItemClick={onItemClick}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        const pageNumber = 6;

        // Simulate clicking on an outline item
        component.instance().viewer.scrollPageIntoView({ pageNumber });

        expect(onItemClick).toHaveBeenCalledTimes(1);
        expect(onItemClick).toHaveBeenCalledWith({ pageNumber });
      });
    });

    it('attempts to find a page and scroll it into view if onItemClick is not given', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        const scrollIntoView = jest.fn();
        const pageNumber = 6;

        // Register fake page in Document viewer
        component.instance().pages[pageNumber - 1] = { scrollIntoView };

        // Simulate clicking on an outline item
        component.instance().viewer.scrollPageIntoView({ pageNumber });

        expect(scrollIntoView).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('linkService', () => {
    /* eslint-disable indent */
    it.each`
      externalLinkTarget | linkServiceTarget
      ${null}            | ${0}
      ${'_self'}         | ${1}
      ${'_blank'}        | ${2}
      ${'_parent'}       | ${3}
      ${'_top'}          | ${4}
    `('returns externalLinkTarget = $linkServiceTarget given externalLinkTarget prop = $externalLinkTarget',
    ({ externalLinkTarget, linkServiceTarget }) => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Document
          externalLinkTarget={externalLinkTarget}
          file={pdfFile.file}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().linkService.externalLinkTarget).toBe(linkServiceTarget);
      });
    });
    /* eslint-enable indent */
  });

  it('calls onClick callback when clicked a page (sample of mouse events family)', () => {
    const onClick = jest.fn();

    const component = mount(
      <Document onClick={onClick} />
    );

    const document = component.find('.react-pdf__Document');
    document.simulate('click');

    expect(onClick).toHaveBeenCalled();
  });

  it('calls onTouchStart callback when touched a page (sample of touch events family)', () => {
    const onTouchStart = jest.fn();

    const component = mount(
      <Document onTouchStart={onTouchStart} />
    );

    const document = component.find('.react-pdf__Document');
    document.simulate('touchstart');

    expect(onTouchStart).toHaveBeenCalled();
  });
});
