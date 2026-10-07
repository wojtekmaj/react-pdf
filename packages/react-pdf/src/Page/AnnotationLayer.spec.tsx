import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { page as browserPage } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ErrorBoundary } from 'react-error-boundary';

import DocumentContext from '../DocumentContext.js';
import { pdfjs } from '../index.test.js';
import LinkService from '../LinkService.js';
import PageContext from '../PageContext.js';
import AnnotationLayer from './AnnotationLayer.js';

import failingPage from '../../../../__mocks__/_failing_page.js';

import { loadPDF, makeAsyncCallback, muteConsole, restoreConsole } from '../../../../test-utils.js';

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { FallbackProps } from 'react-error-boundary';
import type { RenderResult } from 'vitest-browser-react';
import type { Annotations, DocumentContextType, PageContextType } from '../shared/types.js';

const pdfFile = await loadPDF('../../__mocks__/_pdf.pdf');
const annotatedPdfFile = await loadPDF('../../__mocks__/_pdf3.pdf');

async function renderWithContext(
  children: React.ReactNode,
  documentContext: Partial<DocumentContextType>,
  pageContext: Partial<PageContextType>,
) {
  const { rerender, ...otherResult } = await render(
    <DocumentContext.Provider value={documentContext as DocumentContextType}>
      <PageContext.Provider value={{ suspense: false, ...pageContext } as PageContextType}>
        {children}
      </PageContext.Provider>
    </DocumentContext.Provider>,
  );

  const customRerender = async (
    nextChildren: React.ReactNode,
    nextDocumentContext: Partial<DocumentContextType> = documentContext,
    nextPageContext: Partial<PageContextType> = pageContext,
  ) =>
    await rerender(
      <DocumentContext.Provider value={nextDocumentContext as DocumentContextType}>
        <PageContext.Provider value={nextPageContext as PageContextType}>
          {nextChildren}
        </PageContext.Provider>
      </DocumentContext.Provider>,
    );

  return {
    ...otherResult,
    rerender: customRerender,
  } as RenderResult & { rerender: typeof customRerender };
}

function renderError({ error }: FallbackProps): React.ReactNode {
  return <div role="alert">{error instanceof Error ? error.message : String(error)}</div>;
}

describe('AnnotationLayer', () => {
  const linkService = new LinkService();

  // Loaded PDF file
  let pdf: PDFDocumentProxy;

  // Loaded page
  let page: PDFPageProxy;
  let page2: PDFPageProxy;

  // Loaded page text items
  let desiredAnnotations: Annotations;
  let desiredAnnotations2: Annotations;

  beforeAll(async () => {
    pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
    desiredAnnotations = await page.getAnnotations();

    page2 = await pdf.getPage(2);
    desiredAnnotations2 = await page2.getAnnotations();
  });

  describe('loading', () => {
    it('loads annotations and calls onGetAnnotationsSuccess callback properly', async () => {
      const { func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise } =
        makeAsyncCallback();

      await renderWithContext(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onGetAnnotationsSuccess,
          page,
        },
      );

      expect.assertions(1);

      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject([desiredAnnotations]);
    });

    it('calls onGetAnnotationsError when failed to load annotations', async () => {
      const { func: onGetAnnotationsError, promise: onGetAnnotationsErrorPromise } =
        makeAsyncCallback();

      muteConsole();

      await renderWithContext(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onGetAnnotationsError,
          page: failingPage,
        },
      );

      expect.assertions(1);

      await expect(onGetAnnotationsErrorPromise).resolves.toMatchObject([expect.any(Error)]);

      restoreConsole();
    });

    it('replaces annotations properly when page is changed', async () => {
      const { func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise } =
        makeAsyncCallback();

      const { rerender } = await renderWithContext(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onGetAnnotationsSuccess,
          page,
        },
      );

      expect.assertions(2);

      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject([desiredAnnotations]);

      const { func: onGetAnnotationsSuccess2, promise: onGetAnnotationsSuccessPromise2 } =
        makeAsyncCallback();

      await rerender(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onGetAnnotationsSuccess: onGetAnnotationsSuccess2,
          page: page2,
        },
      );

      await expect(onGetAnnotationsSuccessPromise2).resolves.toMatchObject([desiredAnnotations2]);
    });

    it('throws an error when placed outside Page', async () => {
      muteConsole();

      await expect(render(<AnnotationLayer />)).rejects.toThrowError(
        'Invariant failed: Unable to find Page context.',
      );

      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders annotations properly', async () => {
      const {
        func: onRenderAnnotationLayerSuccess,
        promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();

      const { container } = await renderWithContext(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onRenderAnnotationLayerSuccess,
          page,
        },
      );

      expect.assertions(1);

      await onRenderAnnotationLayerSuccessPromise;

      const wrapper = container.firstElementChild as HTMLDivElement;
      const annotationItems = Array.from(wrapper.children);

      expect(annotationItems).toHaveLength(desiredAnnotations.length);
    });

    it('calls onRenderAnnotationLayerError when failed to render annotations', async () => {
      const error = new Error('Annotation rendering failed');
      const renderAnnotationLayer = vi
        .spyOn(pdfjs.AnnotationLayer.prototype, 'render')
        .mockRejectedValueOnce(error);
      const { func: onRenderAnnotationLayerError, promise: onRenderAnnotationLayerErrorPromise } =
        makeAsyncCallback();

      muteConsole();

      try {
        await renderWithContext(
          <AnnotationLayer />,
          { linkService, pdf },
          { onRenderAnnotationLayerError, page },
        );

        await expect(onRenderAnnotationLayerErrorPromise).resolves.toEqual([error]);
      } finally {
        renderAnnotationLayer.mockRestore();
        restoreConsole();
      }
    });

    it.each`
      externalLinkTarget | target
      ${null}            | ${''}
      ${'_self'}         | ${'_self'}
      ${'_blank'}        | ${'_blank'}
      ${'_parent'}       | ${'_parent'}
      ${'_top'}          | ${'_top'}
    `(
      'renders all links with target $target given externalLinkTarget = $externalLinkTarget',
      async ({ externalLinkTarget, target }) => {
        const {
          func: onRenderAnnotationLayerSuccess,
          promise: onRenderAnnotationLayerSuccessPromise,
        } = makeAsyncCallback();
        const customLinkService = new LinkService();
        if (externalLinkTarget) {
          customLinkService.setExternalLinkTarget(externalLinkTarget);
        }

        const { container } = await renderWithContext(
          <AnnotationLayer />,
          {
            linkService: customLinkService,
            pdf,
          },
          {
            onRenderAnnotationLayerSuccess,
            page,
          },
        );

        expect.assertions(desiredAnnotations.length);

        await onRenderAnnotationLayerSuccessPromise;

        const wrapper = container.firstElementChild as HTMLDivElement;
        const annotationItems = Array.from(wrapper.children);
        const annotationLinkItems = annotationItems
          .map((item) => item.firstChild as HTMLElement)
          .filter((item) => item.tagName === 'A');

        for (const link of annotationLinkItems) {
          expect(link).toHaveAttribute('target', target);
        }
      },
    );

    it.each`
      externalLinkRel | rel
      ${null}         | ${'noopener noreferrer nofollow'}
      ${'noopener'}   | ${'noopener'}
    `(
      'renders all links with rel $rel given externalLinkRel = $externalLinkRel',
      async ({ externalLinkRel, rel }) => {
        const {
          func: onRenderAnnotationLayerSuccess,
          promise: onRenderAnnotationLayerSuccessPromise,
        } = makeAsyncCallback();
        const customLinkService = new LinkService();
        if (externalLinkRel) {
          customLinkService.setExternalLinkRel(externalLinkRel);
        }

        const { container } = await renderWithContext(
          <AnnotationLayer />,
          {
            linkService: customLinkService,
            pdf,
          },
          {
            onRenderAnnotationLayerSuccess,
            page,
          },
        );

        expect.assertions(desiredAnnotations.length);

        await onRenderAnnotationLayerSuccessPromise;

        const wrapper = container.firstElementChild as HTMLDivElement;
        const annotationItems = Array.from(wrapper.children);
        const annotationLinkItems = annotationItems
          .map((item) => item.firstChild as HTMLElement)
          .filter((item) => item.tagName === 'A');

        for (const link of annotationLinkItems) {
          expect(link).toHaveAttribute('rel', rel);
        }
      },
    );

    it('renders annotations with the default imageResourcesPath given no imageResourcesPath', async () => {
      const pdf = await pdfjs.getDocument({ data: annotatedPdfFile.arrayBuffer }).promise;
      const annotatedPage = await pdf.getPage(1);

      const {
        func: onRenderAnnotationLayerSuccess,
        promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();
      const imageResourcesPath = '';
      const desiredImageTagRegExp = new RegExp(
        `<img[^>]+src="${imageResourcesPath}annotation-note.svg"`,
      );

      const { container } = await renderWithContext(
        <AnnotationLayer />,
        {
          linkService,
          pdf,
        },
        {
          onRenderAnnotationLayerSuccess,
          page: annotatedPage,
        },
      );

      expect.assertions(1);

      await onRenderAnnotationLayerSuccessPromise;

      const stringifiedAnnotationLayerNode = container.outerHTML;

      expect(stringifiedAnnotationLayerNode).toMatch(desiredImageTagRegExp);
    });

    it('renders annotations with the specified imageResourcesPath given imageResourcesPath', async () => {
      const pdf = await pdfjs.getDocument({ data: annotatedPdfFile.arrayBuffer }).promise;
      const annotatedPage = await pdf.getPage(1);

      const {
        func: onRenderAnnotationLayerSuccess,
        promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();
      const imageResourcesPath = '/public/images/';
      const desiredImageTagRegExp = new RegExp(
        `<img[^>]+src="${imageResourcesPath}annotation-note.svg"`,
      );

      const { container } = await renderWithContext(
        <AnnotationLayer />,
        {
          imageResourcesPath,
          linkService,
          pdf,
        },
        {
          onRenderAnnotationLayerSuccess,
          page: annotatedPage,
        },
      );

      expect.assertions(1);

      await onRenderAnnotationLayerSuccessPromise;

      const stringifiedAnnotationLayerNode = container.outerHTML;

      expect(stringifiedAnnotationLayerNode).toMatch(desiredImageTagRegExp);
    });
  });

  describe('Suspense', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('reports an existing load error when Suspense is enabled without repeating the callback', async () => {
      const failure = new Error('AnnotationLayer failed');
      const onError = vi.fn();
      vi.spyOn(page, 'getAnnotations').mockRejectedValue(failure);

      const children = (
        <ErrorBoundary fallbackRender={renderError}>
          <AnnotationLayer />
        </ErrorBoundary>
      );
      const context = {
        onGetAnnotationsError: onError,
        page,
        rotate: 0,
        scale: 1,
        suspense: false,
      };

      const { rerender } = await renderWithContext(children, { linkService, pdf }, context);

      await expect.poll(() => onError).toHaveBeenCalledExactlyOnceWith(failure);

      await rerender(children, { linkService, pdf }, { ...context, suspense: true });

      await expect.element(browserPage.getByRole('alert')).toHaveTextContent(failure.message);
      expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
    });

    it('forwards asynchronous getAnnotations failures to an Error Boundary', async () => {
      const failure = new Error('AnnotationLayer failed');
      const onError = vi.fn();
      vi.spyOn(page, 'getAnnotations').mockRejectedValue(failure);

      await renderWithContext(
        <ErrorBoundary fallbackRender={renderError}>
          <AnnotationLayer />
        </ErrorBoundary>,
        { linkService, pdf },
        {
          onGetAnnotationsError: onError,
          page,
          rotate: 0,
          scale: 1,
          suspense: true,
        },
      );

      await expect.element(browserPage.getByRole('alert')).toHaveTextContent(failure.message);
      expect(onError).toHaveBeenCalledWith(failure);
    });

    it.each([true, false])(
      'forwards rendering failures when Suspense is enabled (initial suspense=%s)',
      async (suspense) => {
        const failure = new Error('AnnotationLayer failed');
        const onError = vi.fn();
        vi.spyOn(pdfjs.AnnotationLayer.prototype, 'render').mockRejectedValue(failure);

        const children = (
          <ErrorBoundary fallbackRender={renderError}>
            <AnnotationLayer />
          </ErrorBoundary>
        );
        const context = {
          onRenderAnnotationLayerError: onError,
          page,
          rotate: 0,
          scale: 1,
          suspense,
        };

        const { rerender } = await renderWithContext(children, { linkService, pdf }, context);

        if (!suspense) {
          await expect.poll(() => onError).toHaveBeenCalledExactlyOnceWith(failure);

          // Switching modes retries rendering under the new error handling behavior.
          await rerender(children, { linkService, pdf }, { ...context, suspense: true });
        }

        await expect.element(browserPage.getByRole('alert')).toHaveTextContent(failure.message);
        expect(onError).toHaveBeenCalledWith(failure);
      },
    );
  });
});
