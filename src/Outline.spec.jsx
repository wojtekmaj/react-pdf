import React from 'react';
import { mount, shallow } from 'enzyme';

import { pdfjs } from './entry.jest';

import { OutlineInternal as Outline } from './Outline';

import failingPdf from '../__mocks__/_failing_pdf';
import {
  loadPDF, makeAsyncCallback, muteConsole, restoreConsole,
} from '../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');

describe('Outline', () => {
  // Loaded PDF file
  let pdf;
  let pdf2;

  // Object with basic loaded outline information that shall match after successful loading
  let desiredLoadedOutline = null;
  let desiredLoadedOutline2 = null;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;
    pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;

    desiredLoadedOutline = await pdf.getOutline();
    desiredLoadedOutline2 = await pdf2.getOutline();
  });

  describe('loading', () => {
    it('loads an outline and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Outline
          onLoadSuccess={onLoadSuccess}
          pdf={pdf}
        />,
      );

      expect.assertions(1);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);
    });

    it('calls onLoadError when failed to load an outline', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <Outline
          onLoadError={onLoadError}
          pdf={failingPdf}
        />,
      );

      expect.assertions(1);
      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces an outline properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <Outline
          onLoadSuccess={onLoadSuccess}
          pdf={pdf}
        />,
      );

      expect.assertions(2);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({
        onLoadSuccess: onLoadSuccess2,
        pdf: pdf2,
      });

      // It would have been .toMatchObject if not for the fact _pdf2.pdf has no outline
      await expect(onLoadSuccessPromise2).resolves.toBe(desiredLoadedOutline2);
    });

    it('throws an error when placed outside Document', () => {
      expect(() => shallow(<Outline />)).toThrow();
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const className = 'testClassName';

      const component = shallow(
        <Outline
          className={className}
          onLoadSuccess={onLoadSuccess}
          pdf={pdf}
        />,
      );

      expect.assertions(1);
      await onLoadSuccessPromise;

      const wrapperClassName = component.find('.react-pdf__Outline').prop('className');

      expect(wrapperClassName.includes(className)).toBe(true);
    });

    it('passes container element to inputRef properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const inputRef = jest.fn();

      mount(
        <Outline
          inputRef={inputRef}
          onLoadSuccess={onLoadSuccess}
          pdf={pdf}
        />,
      );

      expect.assertions(2);
      await onLoadSuccessPromise;

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it('renders OutlineItem components properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Outline
          onLoadSuccess={onLoadSuccess}
          pdf={pdf}
        />,
      );

      expect.assertions(1);
      await onLoadSuccessPromise;

      const items = component.children().find('OutlineItem');

      expect(items).toHaveLength(desiredLoadedOutline.length);
    });
  });
});
