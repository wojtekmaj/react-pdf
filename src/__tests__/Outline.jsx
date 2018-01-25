import React from 'react';
import { shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import { Outline } from '../entry.noworker';

import failingPdf from '../../__mocks__/_failing_pdf';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from './utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');
const { arrayBuffer: fileArrayBuffer2 } = loadPDF('./__mocks__/_pdf2.pdf');

/* eslint-disable comma-dangle */

describe('Outline', () => {
  // Loaded PDF file
  let pdf;
  let pdf2;

  // Object with basic loaded outline information that shall match after successful loading
  let desiredLoadedOutline = null;
  let desiredLoadedOutline2 = null;

  beforeAll(async () => {
    pdf = await PDFJS.getDocument({ data: fileArrayBuffer });
    pdf2 = await PDFJS.getDocument({ data: fileArrayBuffer2 });

    desiredLoadedOutline = await pdf.getOutline();
    desiredLoadedOutline2 = await pdf2.getOutline();
  });

  describe('loading', () => {
    it('loads an outline and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Outline onLoadSuccess={onLoadSuccess} />,
        {
          context: {
            pdf,
          },
        }
      );

      expect.assertions(1);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);
    });

    it('calls onLoadError when failed to load an outline', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <Outline onLoadError={onLoadError} />,
        {
          context: {
            pdf: failingPdf,
          },
        }
      );

      expect.assertions(1);
      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces an outline properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <Outline onLoadSuccess={onLoadSuccess} />,
        {
          context: {
            pdf,
          },
        }
      );

      expect.assertions(2);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedOutline);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({ onLoadSuccess: onLoadSuccess2 });
      mountedComponent.setContext({ pdf: pdf2 });

      // It would have been .toMatchObject if not for the fact _pdf2.pdf has no outline
      await expect(onLoadSuccessPromise2).resolves.toBe(desiredLoadedOutline2);
    });

    it('throws an error when placed outside Document', () => {
      expect(() => shallow(<Outline />)).toThrow();
    });
  });

  describe('rendering', () => {
    it('renders OutlineItem components properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Outline onLoadSuccess={onLoadSuccess} />,
        {
          context: {
            pdf,
          },
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const items = component.children().find('OutlineItem');

        expect(items).toHaveLength(desiredLoadedOutline.length);
      });
    });
  });
});
