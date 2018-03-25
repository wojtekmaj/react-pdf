import React from 'react';
import { mount, shallow } from 'enzyme';
import pdfjs from 'pdfjs-dist';

import { Page } from '../entry.noworker';

import failingPdf from '../../__mocks__/_failing_pdf';
import silentlyFailingPdf from '../../__mocks__/_silently_failing_pdf';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from './utils';

const { PDFJS } = pdfjs;

const { arrayBuffer: fileArrayBuffer } = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('Page', () => {
  // Loaded PDF file
  let pdf;

  // Object with basic loaded page information that shall match after successful loading
  const desiredLoadedPage = {};
  const desiredLoadedPage2 = {};

  // Callbacks used in registerPage and unregisterPage callbacks
  const registerPageArguments = [];
  let unregisterPageArguments = null;

  beforeAll(async () => {
    pdf = await PDFJS.getDocument({ data: fileArrayBuffer });

    const page = await pdf.getPage(1);
    desiredLoadedPage.pageIndex = page.pageIndex;
    desiredLoadedPage.pageInfo = page.pageInfo;

    const page2 = await pdf.getPage(2);
    desiredLoadedPage2.pageIndex = page2.pageIndex;
    desiredLoadedPage2.pageInfo = page2.pageInfo;

    registerPageArguments.push(
      page.pageIndex,
      undefined, // Page reference is not defined in Enzyme
    );
    unregisterPageArguments = page.pageIndex;
  });

  describe('loading', () => {
    it('loads a page and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);
    });

    it('calls onLoadError when failed to load a page', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      shallow(
        <Page
          onLoadError={onLoadError}
          pageIndex={0}
        />,
        {
          context: {
            pdf: failingPdf,
          }
        }
      );

      expect.assertions(1);
      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('loads page when given pageIndex', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
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
          onLoadSuccess={onLoadSuccess}
          pageNumber={1}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.state().page).toMatchObject(desiredLoadedPage);
      });
    });

    it('calls registerPage when loaded a page', async () => {
      const { func: registerPage, promise: registerPagePromise } = makeAsyncCallback();

      shallow(
        <Page pageIndex={0} />,
        {
          context: {
            pdf,
            registerPage,
          }
        }
      );

      expect.assertions(1);
      await expect(registerPagePromise).resolves.toMatchObject(registerPageArguments);
    });

    it('calls unregisterPage on unmount', async () => {
      const { func: unregisterPage, promise: nuregisterPagePromise } = makeAsyncCallback();

      const component = shallow(
        <Page pageIndex={0} />,
        {
          context: {
            pdf,
            unregisterPage,
          }
        }
      );

      component.unmount();

      expect.assertions(1);
      await expect(nuregisterPagePromise).resolves.toBe(unregisterPageArguments);
    });

    it('replaces a page properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const mountedComponent = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(2);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      mountedComponent.setProps({
        onLoadSuccess: onLoadSuccess2,
        pageIndex: 1,
      });

      await expect(onLoadSuccessPromise2).resolves.toMatchObject(desiredLoadedPage2);
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
        />,
        {
          context: {
            pdf,
          }
        }
      );

      const wrapperClassName = component.find('.react-pdf__Page').prop('className');

      expect(wrapperClassName.includes(className)).toBe(true);
    });

    it('passes container element to inputRef properly', () => {
      const inputRef = jest.fn();

      mount(
        <Page
          inputRef={inputRef}
          pageIndex={1}
        />,
        {
          context: {
            pdf: silentlyFailingPdf,
          }
        }
      );

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it('renders "No page specified." when given neither pageIndex nor pageNumber', () => {
      const component = shallow(
        <Page />,
        {
          context: {
            pdf,
          }
        }
      );

      const noData = component.find('.react-pdf__message--no-data');

      expect(noData).toHaveLength(1);
      expect(noData.text()).toBe('No page specified.');
    });

    it('renders custom no data message when given nothing and noData prop is specified', () => {
      const component = shallow(
        <Page noData="Nothing here" />,
        {
          context: {
            pdf,
          }
        }
      );

      const noData = component.find('.react-pdf__message--no-data');

      expect(noData).toHaveLength(1);
      expect(noData.text()).toBe('Nothing here');
    });

    it('renders "Loading page…" when loading a page', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        const loading = component.find('.react-pdf__message--loading');

        expect(loading).toHaveLength(1);
        expect(loading.text()).toBe('Loading page…');
      });
    });

    it('renders custom loading message when loading a page and loading prop is specified', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          loading="Loading"
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(2);
      return onLoadSuccessPromise.then(() => {
        const loading = component.find('.react-pdf__message--loading');

        expect(loading).toHaveLength(1);
        expect(loading.text()).toBe('Loading');
      });
    });

    it('ignores pageIndex when given pageIndex and pageNumber', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          pageIndex={1}
          pageNumber={1}
          onLoadSuccess={onLoadSuccess}
        />,
        {
          context: {
            pdf,
          }
        }
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
        />,
        {
          context: {
            pdf,
          }
        }
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
          rotate={90}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().rotate).toBe(90);
      });
    });

    it('requests page to be rendered with default rotation when given rotate context', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
            rotate: 90,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().rotate).toBe(90);
      });
    });

    it('requests page to be rendered with rotation passed in props when given rotate both in props and context', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          rotate={180}
        />,
        {
          context: {
            pdf,
            rotate: 90,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        expect(component.instance().rotate).toBe(180);
      });
    });

    it('requests page to be rendered in canvas mode by default', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
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
          renderMode="canvas"
        />,
        {
          context: {
            pdf,
          }
        }
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
          renderMode="svg"
        />,
        {
          context: {
            pdf,
          }
        }
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
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const textLayer = component.find('TextLayer');
        expect(textLayer).toHaveLength(1);
      });
    });

    it('requests text content to be rendered when given renderTextLayer = true', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          renderTextLayer
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const textLayer = component.find('TextLayer');
        expect(textLayer).toHaveLength(1);
      });
    });

    it('does not request text content to be rendered when given renderTextLayer = false', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          renderTextLayer={false}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const textLayer = component.find('TextLayer');
        expect(textLayer).toHaveLength(0);
      });
    });

    it('does not render TextLayer when given renderMode = "svg"', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          renderMode="svg"
          renderTextLayer
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const textLayer = component.find('TextLayer');
        expect(textLayer).toHaveLength(0);
      });
    });

    it('requests annotations to be rendered by default', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const annotationLayer = component.find('AnnotationLayer');
        expect(annotationLayer).toHaveLength(1);
      });
    });

    it('requests annotations to be rendered when given renderAnnotations = true', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          renderAnnotations
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const annotationLayer = component.find('AnnotationLayer');
        expect(annotationLayer).toHaveLength(1);
      });
    });

    it('does not request annotations to be rendered when given renderAnnotations = false', () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const component = shallow(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          renderAnnotations={false}
        />,
        {
          context: {
            pdf,
          }
        }
      );

      expect.assertions(1);
      return onLoadSuccessPromise.then(() => {
        component.update();
        const annotationLayer = component.find('AnnotationLayer');
        expect(annotationLayer).toHaveLength(0);
      });
    });
  });

  it('requests page to be rendered with a proper scale when given width', () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const width = 600;

    const component = shallow(
      <Page
        onLoadSuccess={onLoadSuccess}
        pageIndex={0}
        width={width}
      />,
      {
        context: {
          pdf,
        }
      }
    );

    expect.assertions(1);
    return onLoadSuccessPromise.then((page) => {
      component.update();
      expect(page.width).toEqual(width);
    });
  });
});
