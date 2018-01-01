import React from 'react';
import { mount, shallow } from 'enzyme';
import pdfjs, { RenderingCancelledException } from 'pdfjs-dist';

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

const unregisterPageCallback = desiredLoadedPage.pageIndex;

/* eslint-disable comma-dangle */

const muteConsole = () => {
  global.consoleBackup = global.console;

  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
};

const restoreConsole = () => {
  global.console = global.consoleBackup;
};

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

    it('calls onLoadError when failed to load a page', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <Page
          pageIndex={-1}
          pdf={pdf}
          onLoadError={onLoadError}
        />
      );

      expect.assertions(1);
      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('loads page when given pageIndex', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          pageIndex={0}
          pdf={pdf}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.state().page).toMatchObject(desiredLoadedPage);
      });
    });

    it('loads page when given pageNumber', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          pageNumber={1}
          pdf={pdf}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.state().page).toMatchObject(desiredLoadedPage);
      });
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

    it('calls unregisterPage on unmount', async () => {
      const { func: unregisterPage, promise: nuregisterPagePromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          pageIndex={0}
          pdf={pdf}
          unregisterPage={unregisterPage}
        />
      );

      component.unmount();

      expect.assertions(1);
      await expect(nuregisterPagePromise).resolves.toBe(unregisterPageCallback);
    });

    it('throws an error when placed outside Document', () => {
      expect(() => shallow(<Page pageIndex={0} />)).toThrow();
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

    it('passes container element to inputRef properly', () => {
      // We don't really want to initiate loading a page here
      const silentlyFailingPdf = {
        getDestination: () => {},
        getOutline: () => {},
        getPage: () => new Promise((resolve, reject) => reject(new RenderingCancelledException())),
        numPages: 4,
        pdfInfo: {
          fingerprint: 'a62067476e69734bb8eb60122615dfbf',
          numPages: 4,
        },
      };

      const inputRef = jest.fn();

      mount(
        <Page
          inputRef={inputRef}
          pageIndex={1}
          pdf={silentlyFailingPdf}
        />
      );

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it('ignores pageIndex when given pageIndex and pageNumber', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          pageIndex={1}
          pageNumber={1}
          pdf={pdf}
          onLoadSuccess={onLoadSuccess}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.state().page).toMatchObject(desiredLoadedPage);
      });
    });

    it('orders page to be rendered with default rotation when given nothing', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().rotate).toBe(0);
      });
    });

    it('requests page to be rendered with default rotation when given rotate prop', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          rotate={90}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().rotate).toBe(90);
      });
    });

    it('requests page to be rendered in canvas mode by default', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageCanvas = component.find('PageCanvas');
        expect(pageCanvas).toHaveLength(1);
      });
    });

    it('requests page to be rendered in canvas mode when given renderMode = "canvas"', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderMode="canvas"
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageCanvas = component.find('PageCanvas');
        expect(pageCanvas).toHaveLength(1);
      });
    });

    it('requests page to be rendered in SVG mode when given renderMode = "svg"', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderMode="svg"
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageCanvas = component.find('PageSVG');
        expect(pageCanvas).toHaveLength(1);
      });
    });

    it('requests text content to be rendered by default', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageTextContent = component.find('PageTextContent');
        expect(pageTextContent).toHaveLength(1);
      });
    });

    it('requests text content to be rendered when given renderTextLayer = true', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderTextLayer
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageTextContent = component.find('PageTextContent');
        expect(pageTextContent).toHaveLength(1);
      });
    });

    it('does not request text content to be rendered when given renderTextLayer = false', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderTextLayer={false}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageTextContent = component.find('PageTextContent');
        expect(pageTextContent).toHaveLength(0);
      });
    });

    it('does not render PageTextContent when given renderMode = "svg"', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderMode="svg"
          renderTextLayer
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageTextContent = component.find('PageTextContent');
        expect(pageTextContent).toHaveLength(0);
      });
    });

    it('requests annotations to be rendered by default', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageAnnotations = component.find('PageAnnotations');
        expect(pageAnnotations).toHaveLength(1);
      });
    });

    it('requests annotations to be rendered when given renderAnnotations = true', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderAnnotations
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageAnnotations = component.find('PageAnnotations');
        expect(pageAnnotations).toHaveLength(1);
      });
    });

    it('does not request annotations to be rendered when given renderAnnotations = false', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderAnnotations={false}
        />
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const pageAnnotations = component.find('PageAnnotations');
        expect(pageAnnotations).toHaveLength(0);
      });
    });
  });
});
