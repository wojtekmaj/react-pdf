import { beforeAll, describe, expect, it, vi } from 'vitest';
import React, { createRef } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { pdfjs } from './index.test';

import Page from './Page';

import failingPdf from '../__mocks__/_failing_pdf';
import silentlyFailingPdf from '../__mocks__/_silently_failing_pdf';
import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../test-utils';

import DocumentContext from './DocumentContext';

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { DocumentContextType, PageCallback } from './shared/types';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');
const pdfFile2 = loadPDF('./__mocks__/_pdf2.pdf');
const pdfFile4 = loadPDF('./__mocks__/_pdf4.pdf');

function renderWithContext(children: React.ReactNode, context: Partial<DocumentContextType>) {
  const { rerender, ...otherResult } = render(
    <DocumentContext.Provider value={context as DocumentContextType}>
      {children}
    </DocumentContext.Provider>,
  );

  return {
    ...otherResult,
    rerender: (
      nextChildren: React.ReactNode,
      nextContext: Partial<DocumentContextType> = context,
    ) =>
      rerender(
        <DocumentContext.Provider value={nextContext as DocumentContextType}>
          {nextChildren}
        </DocumentContext.Provider>,
      ),
  };
}

describe('Page', () => {
  // Loaded PDF file
  let pdf: PDFDocumentProxy;
  let pdf2: PDFDocumentProxy;
  let pdf4: PDFDocumentProxy;

  // Object with basic loaded page information that shall match after successful loading
  const desiredLoadedPage: Partial<PDFPageProxy> = {};
  const desiredLoadedPage2: Partial<PDFPageProxy> = {};
  const desiredLoadedPage3: Partial<PDFPageProxy> = {};

  // Callbacks used in registerPage and unregisterPage callbacks
  let registerPageArguments: [number, HTMLDivElement];
  let unregisterPageArguments: [number];

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

    registerPageArguments = [page._pageIndex, expect.any(HTMLDivElement)];
    unregisterPageArguments = [page._pageIndex];

    pdf4 = await pdfjs.getDocument({ data: pdfFile4.arrayBuffer }).promise;
  });

  describe('loading', () => {
    it('loads a page and calls onLoadSuccess callback properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, { pdf });

      expect.assertions(1);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPage]);
    });

    it('returns all desired parameters in onLoadSuccess callback', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
        makeAsyncCallback<[PageCallback]>();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, { pdf });

      expect.assertions(5);

      const [page] = await onLoadSuccessPromise;

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

      renderWithContext(<Page onLoadError={onLoadError} pageIndex={0} />, { pdf: failingPdf });

      expect.assertions(1);

      await expect(onLoadErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('loads page when given pageIndex', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, { pdf });

      expect.assertions(1);

      const [page] = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('loads page when given pageNumber', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageNumber={1} />, { pdf });

      expect.assertions(1);

      const [page] = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('loads page of a given number when given conflicting pageNumber and pageIndex', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={1} pageNumber={1} />, {
        pdf,
      });

      expect.assertions(1);

      const [page] = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('calls registerPage when loaded a page', async () => {
      const { func: registerPage, promise: registerPagePromise } = makeAsyncCallback();

      renderWithContext(<Page pageIndex={0} />, { pdf, registerPage });

      expect.assertions(1);

      await expect(registerPagePromise).resolves.toMatchObject(registerPageArguments);
    });

    it('calls unregisterPage on unmount', async () => {
      const { func: unregisterPage, promise: nuregisterPagePromise } = makeAsyncCallback();

      const { unmount } = renderWithContext(<Page pageIndex={0} />, { pdf, unregisterPage });

      unmount();

      expect.assertions(1);

      await expect(nuregisterPagePromise).resolves.toMatchObject(unregisterPageArguments);
    });

    it('replaces a page properly when pdf is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, {
        pdf,
      });

      expect.assertions(2);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPage]);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Page onLoadSuccess={onLoadSuccess2} pageIndex={0} />, { pdf: pdf2 });

      await expect(onLoadSuccessPromise2).resolves.toMatchObject([desiredLoadedPage3]);
    });

    it('replaces a page properly when pageNumber is changed', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { rerender } = renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, {
        pdf,
      });

      expect.assertions(2);

      await expect(onLoadSuccessPromise).resolves.toMatchObject([desiredLoadedPage]);

      const { func: onLoadSuccess2, promise: onLoadSuccessPromise2 } = makeAsyncCallback();

      rerender(<Page onLoadSuccess={onLoadSuccess2} pageIndex={1} />, { pdf });

      await expect(onLoadSuccessPromise2).resolves.toMatchObject([desiredLoadedPage2]);
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

      const { container } = renderWithContext(<Page className={className} pageIndex={0} />, {
        pdf,
      });

      const wrapper = container.querySelector('.react-pdf__Page');

      expect(wrapper).toHaveClass(className);
    });

    it('passes container element to inputRef properly', () => {
      const inputRef = createRef<HTMLDivElement>();

      renderWithContext(<Page inputRef={inputRef} pageIndex={1} />, {
        pdf: silentlyFailingPdf,
      });

      expect(inputRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('passes canvas element to PageCanvas properly', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const canvasRef = createRef<HTMLCanvasElement>();

      const { container } = renderWithContext(
        <Page canvasRef={canvasRef} onLoadSuccess={onLoadSuccess} pageIndex={0} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');

      expect(canvasRef.current).toBe(pageCanvas);
    });

    it('renders "No page specified." when given neither pageIndex nor pageNumber', () => {
      muteConsole();

      const { container } = renderWithContext(<Page />, { pdf });

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('No page specified.');

      restoreConsole();
    });

    it('renders custom no data message when given nothing and noData is given', () => {
      muteConsole();

      const { container } = renderWithContext(<Page noData="Nothing here" />, { pdf });

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');

      restoreConsole();
    });

    it('renders custom no data message when given nothing and noData is given as a function', () => {
      muteConsole();

      const { container } = renderWithContext(<Page noData={() => 'Nothing here'} />, { pdf });

      const noData = container.querySelector('.react-pdf__message');

      expect(noData).toBeInTheDocument();
      expect(noData).toHaveTextContent('Nothing here');

      restoreConsole();
    });

    it('renders "Loading page…" when loading a page', async () => {
      const { container } = renderWithContext(<Page pageIndex={0} />, { pdf });

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading page…');
    });

    it('renders custom loading message when loading a page and loading prop is given', async () => {
      const { container } = renderWithContext(<Page loading="Loading" pageIndex={0} />, { pdf });

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('renders custom loading message when loading a page and loading prop is given as a function', async () => {
      const { container } = renderWithContext(<Page loading={() => 'Loading'} pageIndex={0} />, {
        pdf,
      });

      const loading = container.querySelector('.react-pdf__message');

      expect(loading).toBeInTheDocument();
      expect(loading).toHaveTextContent('Loading');
    });

    it('ignores pageIndex when given pageIndex and pageNumber', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={1} pageNumber={1} />, {
        pdf,
      });

      expect.assertions(1);

      const [page] = await onLoadSuccessPromise;

      expect(page).toMatchObject(desiredLoadedPage);
    });

    it('requests page to be rendered with default rotation when given nothing', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } =
        makeAsyncCallback<[PageCallback]>();

      const { container } = renderWithContext(
        <Page onRenderSuccess={onRenderSuccess} pageIndex={0} renderMode="svg" />,
        { pdf },
      );

      const [page] = await onRenderSuccessPromise;

      const pageSvg = container.querySelector('.react-pdf__Page__svg') as SVGElement;

      const { width, height } = window.getComputedStyle(pageSvg);

      const viewport = page.getViewport({ scale: 1 });

      // Expect the SVG layer not to be rotated
      expect(parseInt(width, 10)).toBe(Math.floor(viewport.width));
      expect(parseInt(height, 10)).toBe(Math.floor(viewport.height));
    });

    it('requests page to be rendered with given rotation when given rotate prop', async () => {
      const { func: onRenderSuccess, promise: onRenderSuccessPromise } =
        makeAsyncCallback<[PageCallback]>();
      const rotate = 90;

      const { container } = renderWithContext(
        <Page onRenderSuccess={onRenderSuccess} pageIndex={0} renderMode="svg" rotate={rotate} />,
        { pdf },
      );

      const [page] = await onRenderSuccessPromise;

      const pageSvg = container.querySelector('.react-pdf__Page__svg') as SVGElement;

      const { width, height } = window.getComputedStyle(pageSvg);

      const viewport = page.getViewport({ scale: 1, rotation: rotate });

      // Expect the SVG layer to be rotated
      expect(parseInt(width, 10)).toBe(Math.floor(viewport.width));
      expect(parseInt(height, 10)).toBe(Math.floor(viewport.height));
    });

    it('requests page to be rendered in canvas mode by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');

      expect(pageCanvas).toBeInTheDocument();
    });

    it('requests page not to be rendered when given renderMode = "none"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderMode="none" />,
        { pdf },
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

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderMode="canvas" />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageCanvas = container.querySelector('.react-pdf__Page__canvas');

      expect(pageCanvas).toBeInTheDocument();
    });

    it('requests page to be rendered in SVG mode when given renderMode = "svg"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderMode="svg" />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const pageSVG = container.querySelector('.react-pdf__Page__svg');

      expect(pageSVG).toBeInTheDocument();
    });

    it('requests text content to be rendered by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');

      expect(textLayer).toBeInTheDocument();
    });

    it('requests text content to be rendered when given renderTextLayer = true', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderTextLayer />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');

      expect(textLayer).toBeInTheDocument();
    });

    it('does not request text content to be rendered when given renderTextLayer = false', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderTextLayer={false} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');

      expect(textLayer).not.toBeInTheDocument();
    });

    it('renders TextLayer when given renderMode = "canvas"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderMode="canvas" renderTextLayer />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');

      expect(textLayer).toBeInTheDocument();
    });

    it('renders TextLayer when given renderMode = "svg"', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderMode="svg" renderTextLayer />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const textLayer = container.querySelector('.react-pdf__Page__textContent');

      expect(textLayer).toBeInTheDocument();
    });

    it('requests annotations to be rendered by default', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');

      expect(annotationLayer).toBeInTheDocument();
    });

    it('requests annotations to be rendered when given renderAnnotationLayer = true', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderAnnotationLayer />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');

      expect(annotationLayer).toBeInTheDocument();
    });

    it('does not request annotations to be rendered when given renderAnnotationLayer = false', async () => {
      const { func: onLoadSuccess, promise: onLoadSuccessPromise } = makeAsyncCallback();

      const { container } = renderWithContext(
        <Page onLoadSuccess={onLoadSuccess} pageIndex={0} renderAnnotationLayer={false} />,
        { pdf },
      );

      expect.assertions(1);

      await onLoadSuccessPromise;

      const annotationLayer = container.querySelector('.react-pdf__Page__annotations');

      expect(annotationLayer).not.toBeInTheDocument();
    });
  });

  it('requests page to be rendered without forms by default', async () => {
    const { func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise } =
      makeAsyncCallback();

    const { container } = renderWithContext(
      <Page
        onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
        pageIndex={0}
        renderMode="none"
      />,
      { pdf: pdf4 },
    );

    expect.assertions(1);

    await onRenderAnnotationLayerSuccessPromise;

    const textWidgetAnnotation = container.querySelector('.textWidgetAnnotation');

    expect(textWidgetAnnotation).toBeFalsy();
  });

  it('requests page to be rendered with forms given renderForms = true', async () => {
    const { func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise } =
      makeAsyncCallback();

    const { container } = renderWithContext(
      <Page
        onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
        pageIndex={0}
        renderForms
        renderMode="none"
      />,
      { pdf: pdf4 },
    );

    expect.assertions(1);

    await onRenderAnnotationLayerSuccessPromise;

    const textWidgetAnnotation = container.querySelector('.textWidgetAnnotation');

    expect(textWidgetAnnotation).toBeTruthy();
  });

  it('requests page to be rendered at its original size given nothing', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();

    renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} />, { pdf });

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toEqual(page.originalWidth);
  });

  it('requests page to be rendered with a proper scale when given scale', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const scale = 1.5;

    renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} scale={scale} />, { pdf });

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toEqual(page.originalWidth * scale);
  });

  it('requests page to be rendered with a proper scale when given width', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const width = 600;

    renderWithContext(<Page onLoadSuccess={onLoadSuccess} pageIndex={0} width={width} />, { pdf });

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toEqual(width);
  });

  it('requests page to be rendered with a proper scale when given width and scale (multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const width = 600;
    const scale = 1.5;

    renderWithContext(
      <Page onLoadSuccess={onLoadSuccess} pageIndex={0} scale={scale} width={width} />,
      {
        pdf,
      },
    );

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toBeCloseTo(width * scale);
  });

  it('requests page to be rendered with a proper scale when given height', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const height = 850;

    renderWithContext(<Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} />, {
      pdf,
    });

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.height).toEqual(height);
  });

  it('requests page to be rendered with a proper scale when given height and scale (multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const height = 850;
    const scale = 1.5;

    renderWithContext(
      <Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} scale={scale} />,
      {
        pdf,
      },
    );

    expect.assertions(1);

    const [page] = await onLoadSuccessPromise;

    expect(page.height).toBeCloseTo(height * scale);
  });

  it('requests page to be rendered with a proper scale when given width and height (ignores height)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const width = 600;
    const height = 100;

    renderWithContext(
      <Page height={height} onLoadSuccess={onLoadSuccess} pageIndex={0} width={width} />,
      {
        pdf,
      },
    );

    expect.assertions(2);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toEqual(width);
    // Expect proportions to be correct even though invalid height was provided
    expect(page.height).toEqual(page.originalHeight * (page.width / page.originalWidth));
  });

  it('requests page to be rendered with a proper scale when given width, height and scale (ignores height, multiplies)', async () => {
    const { func: onLoadSuccess, promise: onLoadSuccessPromise } =
      makeAsyncCallback<[PageCallback]>();
    const width = 600;
    const height = 100;
    const scale = 1.5;

    renderWithContext(
      <Page
        height={height}
        onLoadSuccess={onLoadSuccess}
        pageIndex={0}
        scale={scale}
        width={width}
      />,
      { pdf },
    );

    expect.assertions(2);

    const [page] = await onLoadSuccessPromise;

    expect(page.width).toBeCloseTo(width * scale);
    // Expect proportions to be correct even though invalid height was provided
    expect(page.height).toEqual(page.originalHeight * (page.width / page.originalWidth));
  });

  it('calls onClick callback when clicked a page (sample of mouse events family)', () => {
    const onClick = vi.fn();

    const { container } = renderWithContext(<Page onClick={onClick} />, { pdf });

    const page = container.querySelector('.react-pdf__Page') as HTMLDivElement;
    fireEvent.click(page);

    expect(onClick).toHaveBeenCalled();
  });

  it('calls onTouchStart callback when touched a page (sample of touch events family)', () => {
    const onTouchStart = vi.fn();

    const { container } = renderWithContext(<Page onTouchStart={onTouchStart} />, { pdf });

    const page = container.querySelector('.react-pdf__Page') as HTMLDivElement;
    fireEvent.touchStart(page);

    expect(onTouchStart).toHaveBeenCalled();
  });
});
