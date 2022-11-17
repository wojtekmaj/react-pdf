import React, { createRef } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { pdfjs } from './entry.jest';

import { PageInternal as Page } from './Page';

import failingPdf from '../__mocks__/_failing_pdf';
import silentlyFailingPdf from '../__mocks__/_silently_failing_pdf';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');

jest.mock(
  './Page/AnnotationLayer',
  () =>
    function AnnotationLayer() {
      return <div className="react-pdf__Page__annotations" />;
    },
);

describe('Page', () => {
  // Loaded PDF file
  let pdf;
  let pdf2;

  // Object with basic loaded page information that shall match after successful loading
  const desiredLoadedPage = {};
  const desiredLoadedPage2 = {};
  const desiredLoadedPage3 = {};

  // Callbacks used in registerPage and unregisterPage callbacks
  const registerPageArguments = [];
  let unregisterPageArguments = null;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    const page = await pdf.getPage(1);
    desiredLoadedPage._pageIndex = page._pageIndex;
    desiredLoadedPage._pageInfo = page._pageInfo;

    const page2 = await pdf.getPage(2);
    desiredLoadedPage2._pageIndex = page2._pageIndex;
    desiredLoadedPage2._pageInfo = page2._pageInfo;

    pdf2 = await pdfjs.getDocument({ data: pdfFile2.arrayBuffer }).promise;

    const page3 = await pdf2.getPage(1);
    desiredLoadedPage3._pageIndex = page3._pageIndex;
    desiredLoadedPage3._pageInfo = page3._pageInfo;

    registerPageArguments.push(page._pageIndex, expect.any(HTMLDivElement));
    unregisterPageArguments = page._pageIndex;
  });

  describe('loading', () => {
    it('loads a page and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(1);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);
    });

    it('returns all desired parameters in onLoadSuccess callback', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(5);

      const page = await onLoadSuccessPromise;

      expect(page.width).toBeDefined();
      expect(page.height).toBeDefined();
      expect(page.originalWidth).toBeDefined();
      expect(page.originalHeight).toBeDefined();
      // Example of a method that got stripped away in the past
      expect(page.getTextContent).toBeInstanceOf(Function);
    });

    it('calls onLoadError when failed to load a page', async () => {
      const { func: onLoadError, promise: onLoadErrorPromise } = makeAsyncCallback();

      muteConsole();

      render(<Page onLoadError={onLoadError} pageIndex={0} pdf={failingPdf} />);

      expect.assertions(1);
      await expect(onLoadErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('loads page when given pageIndex', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(1);

      const page = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('loads page when given pageNumber', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Page onLoadSuccess={onLoadSuccess} pageNumber={1} pdf={pdf} />);

      expect.assertions(1);

      const page = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('calls registerPage when loaded a page', async () => {
      const { func: registerPage, promise: registerPagePromise } = makeAsyncCallback();

      render(<Page pageIndex={0} pdf={pdf} registerPage={registerPage} />);

      expect.assertions(1);
      await expect(registerPagePromise).resolves.toMatchObject(registerPageArguments);
    });

    it('calls unregisterPage on unmount', async () => {
      const { func: unregisterPage, promise: nuregisterPagePromise } = makeAsyncCallback();

      const { unmount } = render(<Page pageIndex={0} pdf={pdf} unregisterPage={unregisterPage} />);

      unmount();

      expect.assertions(1);
      await expect(nuregisterPagePromise).resolves.toBe(unregisterPageArguments);
    });

    it('replaces a page properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(2);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Page onLoadSuccess={onLoadSuccess2} pageIndex={0} pdf={pdf2} />);

      await expect(onLoadSuccessPromise2).resolves.toMatchObject(desiredLoadedPage3);
    });

    it('replaces a page properly when pageNumber is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(2);
      await expect(onLoadSuccessPromise).resolves.toMatchObject(desiredLoadedPage);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Page onLoadSuccess={onLoadSuccess2} pageIndex={1} pdf={pdf} />);

      await expect(onLoadSuccessPromise2).resolves.toMatchObject(desiredLoadedPage2);
    });

    it('throws an error when placed outside Document', () => {
      muteConsole();
      expect(() => render(<Page pageIndex={0} />)).toThrow();
      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('applies className to its wrapper when given a string', () => {
      const className = 'testClassName';

      const { container } = render(<Page className={className} pageIndex={0} pdf={pdf} />);

      const wrapper = container.querySelector('.react-pdf__Page');

      expect(wrapper).toHaveClass(className);
    });

    it('passes container element to inputRef properly', () => {
      const inputRef = jest.fn();

      render(<Page inputRef={inputRef} pageIndex={1} pdf={silentlyFailingPdf} />);

      expect(inputRef).toHaveBeenCalled();
      expect(inputRef.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it('passes canvas element to PageCanvas properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const canvasRef = createRef();

      const { container } = render(
        <Page canvasRef={canvasRef} onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');

      expect(canvasRef.current).toBe(pageCanvas);
    });

    it('renders "No page specified." when given neither pageIndex nor pageNumber', () => {
      muteConsole();

      const { container } = render(<Page pdf={pdf} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('No page specified.');

      restoreConsole();
    });

    it('renders custom no data message when given nothing and noData is given', () => {
      muteConsole();

      const { container } = render(<Page noData="Nothing here" pdf={pdf} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');

      restoreConsole();
    });

    it('renders custom no data message when given nothing and noData is given as a function', () => {
      muteConsole();

      const { container } = render(<Page noData={() => 'Nothing here'} pdf={pdf} />);

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');

      restoreConsole();
    });

    it('renders "Loading page…" when loading a page', async () => {
      const { container } = render(<Page pageIndex={0} pdf={pdf} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading page…');
    });

    it('renders custom loading message when loading a page and loading prop is given', async () => {
      const { container } = render(<Page loading="Loading" pageIndex={0} pdf={pdf} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('renders custom loading message when loading a page and loading prop is given as a function', async () => {
      const { container } = render(<Page loading={() => 'Loading'} pageIndex={0} pdf={pdf} />);

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('ignores pageIndex when given pageIndex and pageNumber', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      render(<Page onLoadSuccess={onLoadSuccess} pageIndex={1} pageNumber={1} pdf={pdf} />);

      expect.assertions(1);

      const page = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('requests page to be rendered with default rotation when given nothing', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
      const instance = createRef();

      render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} ref={instance} />);

      await onLoadSuccessPromise;

      expect(instance.current.rotate).toBe(0);
    });

    it('requests page to be rendered with given rotation when given rotate prop', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
      const instance = createRef();

      render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} rotate={90} ref={instance} />,
      );

      await onLoadSuccessPromise;

      expect(instance.current.rotate).toBe(90);
    });

    it('requests page to be rendered in canvas mode by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');
      expect(pageCanvas).toBeInTheDocument();
    });

    it('requests page not to be rendered when given renderMode = "none"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderMode="none" />,
      );

      expect.assertions(2);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');
      const pageSVG = container.querySelector('.react-pdf__Page__svg');
      expect(pageCanvas).not.toBeInTheDocument();
      expect(pageSVG).not.toBeInTheDocument();
    });

    it('requests page to be rendered in canvas mode when given renderMode = "canvas"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderMode="canvas" />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');
      expect(pageCanvas).toBeInTheDocument();
    });

    it('requests page to be rendered in SVG mode when given renderMode = "svg"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderMode="svg" />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageSVG = container.querySelector('.react-pdf__Page__svg');
      expect(pageSVG).toBeInTheDocument();
    });

    it('requests text content to be rendered by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');
      expect(textLayer).toBeInTheDocument();
    });

    it('requests text content to be rendered when given renderTextLayer = true', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderTextLayer />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');
      expect(textLayer).toBeInTheDocument();
    });

    it('does not request text content to be rendered when given renderTextLayer = false', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderTextLayer={false} />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');
      expect(textLayer).not.toBeInTheDocument();
    });

    it('renders TextLayer when given renderMode = "canvas"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderMode="canvas"
          renderTextLayer
        />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');
      expect(textLayer).toBeInTheDocument();
    });

    it('renders TextLayer when given renderMode = "svg"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderMode="svg"
          renderTextLayer
        />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');
      expect(textLayer).toBeInTheDocument();
    });

    it('requests annotations to be rendered by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');
      expect(annotationLayer).toBeInTheDocument();
    });

    it('requests annotations to be rendered when given renderAnnotationLayer = true', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} renderAnnotationLayer />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');
      expect(annotationLayer).toBeInTheDocument();
    });

    it('does not request annotations to be rendered when given renderAnnotationLayer = false', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = render(
        <Page
          onLoadSuccess={onLoadSuccess}
          pageIndex={0}
          pdf={pdf}
          renderAnnotationLayer={false}
        />,
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');
      expect(annotationLayer).not.toBeInTheDocument();
    });
  });

  it('requests page to be rendered without forms by default', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const instance = createRef();

    render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} ref={instance} />);

    expect.assertions(1);

    await onLoadSuccessPromise;

    expect(instance.current.childContext.renderForms).toBeFalsy();
  });

  it('requests page to be rendered with forms given renderForms = true', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const instance = createRef();

    render(
      <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} ref={instance} renderForms />,
    );

    expect.assertions(1);

    await onLoadSuccessPromise;

    expect(instance.current.childContext.renderForms).toBe(true);
  });

  it('requests page to be rendered with forms given legacy renderInteractiveForms = true', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const instance = createRef();

    render(
      <Page
        onLoadSuccess={onLoadSuccess}
        pageIndex={0}
        pdf={pdf}
        ref={instance}
        renderInteractiveForms
      />,
    );

    expect.assertions(1);

    await onLoadSuccessPromise;

    expect(instance.current.childContext.renderForms).toBe(true);
  });

  it('requests page to be rendered without forms given renderForms = false and legacy renderInteractiveForms = true', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const instance = createRef();

    render(
      <Page
        onLoadSuccess={onLoadSuccess}
        pageIndex={0}
        pdf={pdf}
        ref={instance}
        renderForms={false}
        renderInteractiveForms
      />,
    );

    expect.assertions(1);

    await onLoadSuccessPromise;

    expect(instance.current.childContext.renderForms).toBeFalsy();
  });

  it('requests page to be rendered at its original size given nothing', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

    render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.width).toEqual(page.originalWidth);
  });

  it('requests page to be rendered with a proper scale when given scale', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const scale = 1.5;

    render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} scale={scale} />);

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.width).toEqual(page.originalWidth * scale);
  });

  it('requests page to be rendered with a proper scale when given width', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const width = 600;

    render(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} width={width} />);

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.width).toEqual(width);
  });

  it('requests page to be rendered with a proper scale when given width and scale (multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const width = 600;
    const scale = 1.5;

    render(
      <Page onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} scale={scale} width={width} />,
    );

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.width).toBeCloseTo(width * scale);
  });

  it('requests page to be rendered with a proper scale when given height', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const height = 850;

    render(<Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} />);

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.height).toEqual(height);
  });

  it('requests page to be rendered with a proper scale when given height and scale (multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const height = 850;
    const scale = 1.5;

    render(
      <Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} scale={scale} />,
    );

    expect.assertions(1);

    const page = await onLoadSuccessPromise;

    expect(page.height).toBeCloseTo(height * scale);
  });

  it('requests page to be rendered with a proper scale when given width and height (ignores height)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const width = 600;
    const height = 100;

    render(
      <Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} pdf={pdf} width={width} />,
    );

    expect.assertions(2);

    const page = await onLoadSuccessPromise;

    expect(page.width).toEqual(width);
    // Expect proportions to be correct even though invalid height was provided
    expect(page.height).toEqual(page.originalHeight * (page.width / page.originalWidth));
  });

  it('requests page to be rendered with a proper scale when given width, height and scale (ignores height, multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();
    const width = 600;
    const height = 100;
    const scale = 1.5;

    render(
      <Page
        height={height}
        onLoadSuccess={onLoadSuccess}
        pageIndex={0}
        pdf={pdf}
        scale={scale}
        width={width}
      />,
    );

    expect.assertions(2);

    const page = await onLoadSuccessPromise;

    expect(page.width).toBeCloseTo(width * scale);
    // Expect proportions to be correct even though invalid height was provided
    expect(page.height).toEqual(page.originalHeight * (page.width / page.originalWidth));
  });

  it('calls onClick callback when clicked a page (sample of mouse events family)', () => {
    const onClick = jest.fn();

    const { container } = render(<Page onClick={onClick} pdf={pdf} />);

    const page = container.querySelector('.react-pdf__Page');
    fireEvent.click(page);

    expect(onClick).toHaveBeenCalled();
  });

  it('calls onTouchStart callback when touched a page (sample of touch events family)', () => {
    const onTouchStart = jest.fn();

    const { container } = render(<Page onTouchStart={onTouchStart} pdf={pdf} />);

    const page = container.querySelector('.react-pdf__Page');
    fireEvent.touchStart(page);

    expect(onTouchStart).toHaveBeenCalled();
  });
});
