'use client';

import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import mergeRefs from 'merge-refs';
import invariant from 'tiny-invariant';
import warning from 'warning';

import Message from './Message.js';
import AnnotationLayer from './Page/AnnotationLayer.js';
import Canvas from './Page/Canvas.js';
import TextLayer from './Page/TextLayer.js';
import PageContext from './PageContext.js';

import useDocumentContext from './shared/hooks/useDocumentContext.js';
import useResolver from './shared/hooks/useResolver.js';

import { cancelRunningTask, isProvided, makePageCallback } from './shared/utils.js';

import type { EventProps } from 'make-event-props';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type {
  ClassName,
  CustomRenderer,
  CustomTextRenderer,
  NodeOrRenderer,
  OnGetAnnotationsError,
  OnGetAnnotationsSuccess,
  OnGetStructTreeError,
  OnGetStructTreeSuccess,
  OnGetTextError,
  OnGetTextSuccess,
  OnPageLoadError,
  OnPageLoadSuccess,
  OnRenderAnnotationLayerError,
  OnRenderAnnotationLayerSuccess,
  OnRenderError,
  OnRenderSuccess,
  OnRenderTextLayerError,
  OnRenderTextLayerSuccess,
  PageCallback,
  PageContextType,
  PageRenderProps,
  RenderMode,
} from './shared/types.js';

const defaultScale = 1;

export type PageProps = {
  _className?: string;
  _enableRegisterUnregisterPage?: boolean;
  /**
   * Canvas background color. Any valid `canvas.fillStyle` can be used.
   *
   * @example 'transparent'
   */
  canvasBackground?: string;
  /**
   * A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to `<canvas>` rendered by `<PageCanvas>` component.
   *
   * @example (ref) => { this.myCanvas = ref; }
   * @example this.ref
   * @example ref
   */
  canvasRef?: React.Ref<HTMLCanvasElement>;
  children?: React.ReactNode | ((props: PageRenderProps) => React.ReactNode);
  /**
   * Class name(s) that will be added to rendered element along with the default `react-pdf__Page`.
   *
   * @example 'custom-class-name-1 custom-class-name-2'
   * @example ['custom-class-name-1', 'custom-class-name-2']
   */
  className?: ClassName;
  /**
   * Function that customizes how a page is rendered. You must set `renderMode` to `"custom"` to use this prop.
   *
   * @example MyCustomRenderer
   */
  customRenderer?: CustomRenderer;
  /**
   * Function that customizes how a text layer is rendered.
   *
   * @example ({ str, itemIndex }) => str.replace(/ipsum/g, value => `<mark>${value}</mark>`)
   */
  customTextRenderer?: CustomTextRenderer;
  /**
   * The ratio between physical pixels and device-independent pixels (DIPs) on the current device.
   *
   * @default window.devicePixelRatio
   * @example 1
   */
  devicePixelRatio?: number;
  /**
   * What the component should display in case of an error.
   *
   * @default 'Failed to load the page.'
   * @example 'An error occurred!'
   * @example <p>An error occurred!</p>
   * @example this.renderError
   */
  error?: NodeOrRenderer;
  /**
   * Page height. If neither `height` nor `width` are defined, page will be rendered at the size defined in PDF. If you define `width` and `height` at the same time, `height` will be ignored. If you define `height` and `scale` at the same time, the height will be multiplied by a given factor.
   *
   * @example 300
   */
  height?: number;
  /**
   * The path used to prefix the src attributes of annotation SVGs.
   *
   * @default ''
   * @example '/public/images/'
   */
  imageResourcesPath?: string;
  /**
   * A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Page>` component.
   *
   * @example (ref) => { this.myPage = ref; }
   * @example this.ref
   * @example ref
   */
  inputRef?: React.Ref<HTMLDivElement | null>;
  /**
   * What the component should display while loading.
   *
   * @default 'Loading page…'
   * @example 'Please wait!'
   * @example <p>Please wait!</p>
   * @example this.renderLoader
   */
  loading?: NodeOrRenderer;
  /**
   *  What the component should display in case of no data.
   *
   * @default 'No page specified.'
   * @example 'Please select a page.'
   * @example <p>Please select a page.</p>
   * @example this.renderNoData
   */
  noData?: NodeOrRenderer;
  /**
   * Function called in case of an error while loading annotations.
   *
   * @example (error) => alert('Error while loading annotations! ' + error.message)
   */
  onGetAnnotationsError?: OnGetAnnotationsError;
  /**
   * Function called when annotations are successfully loaded.
   *
   * @example (annotations) => alert('Now displaying ' + annotations.length + ' annotations!')
   */
  onGetAnnotationsSuccess?: OnGetAnnotationsSuccess;
  /**
   * Function called in case of an error while loading structure tree.
   *
   * @example (error) => alert('Error while loading structure tree! ' + error.message)
   */
  onGetStructTreeError?: OnGetStructTreeError;
  /**
   * Function called when structure tree is successfully loaded.
   *
   * @example (structTree) => alert(JSON.stringify(structTree))
   */
  onGetStructTreeSuccess?: OnGetStructTreeSuccess;
  /**
   * Function called in case of an error while loading text layer items.
   *
   * @example (error) => alert('Error while loading text layer items! ' + error.message)
   */
  onGetTextError?: OnGetTextError;
  /**
   * Function called when text layer items are successfully loaded.
   *
   * @example ({ items, styles }) => alert('Now displaying ' + items.length + ' text layer items!')
   */
  onGetTextSuccess?: OnGetTextSuccess;
  /**
   * Function called in case of an error while loading the page.
   *
   * @example (error) => alert('Error while loading page! ' + error.message)
   */
  onLoadError?: OnPageLoadError;
  /**
   * Function called when the page is successfully loaded.
   *
   * @example (page) => alert('Now displaying a page number ' + page.pageNumber + '!')
   */
  onLoadSuccess?: OnPageLoadSuccess;
  /**
   * Function called in case of an error while rendering the annotation layer.
   *
   * @example (error) => alert('Error while rendering annotation layer! ' + error.message)
   */
  onRenderAnnotationLayerError?: OnRenderAnnotationLayerError;
  /**
   * Function called when annotations are successfully rendered on the screen.
   *
   * @example () => alert('Rendered the annotation layer!')
   */
  onRenderAnnotationLayerSuccess?: OnRenderAnnotationLayerSuccess;
  /**
   * Function called in case of an error while rendering the page.
   *
   * @example (error) => alert('Error while loading page! ' + error.message)
   */
  onRenderError?: OnRenderError;
  /**
   * Function called when the page is successfully rendered on the screen.
   *
   * @example () => alert('Rendered the page!')
   */
  onRenderSuccess?: OnRenderSuccess;
  /**
   * Function called in case of an error while rendering the text layer.
   *
   * @example (error) => alert('Error while rendering text layer! ' + error.message)
   */
  onRenderTextLayerError?: OnRenderTextLayerError;
  /**
   * Function called when the text layer is successfully rendered on the screen.
   *
   * @example () => alert('Rendered the text layer!')
   */
  onRenderTextLayerSuccess?: OnRenderTextLayerSuccess;
  /**
   * Which page from PDF file should be displayed, by page index. Ignored if `pageNumber` prop is provided.
   *
   * @default 0
   * @example 1
   */
  pageIndex?: number;
  /**
   * Which page from PDF file should be displayed, by page number. If provided, `pageIndex` prop will be ignored.
   *
   * @default 1
   * @example 2
   */
  pageNumber?: number;
  /**
   * pdf object obtained from `<Document />`'s `onLoadSuccess` callback function.
   *
   * @example pdf
   */
  pdf?: PDFDocumentProxy | false;
  registerPage?: undefined;
  /**
   * Whether annotations (e.g. links) should be rendered.
   *
   * @default true
   * @example false
   */
  renderAnnotationLayer?: boolean;
  /**
   * Whether forms should be rendered. `renderAnnotationLayer` prop must be set to `true`.
   *
   * @default false
   * @example true
   */
  renderForms?: boolean;
  /**
   * Rendering mode of the document. Can be `"canvas"`, `"custom"` or `"none"`. If set to `"custom"`, `customRenderer` must also be provided.
   *
   * @default 'canvas'
   * @example 'custom'
   */
  renderMode?: RenderMode;
  /**
   * Whether a text layer should be rendered.
   *
   * @default true
   * @example false
   */
  renderTextLayer?: boolean;
  /**
   * Rotation of the page in degrees. `90` = rotated to the right, `180` = upside down, `270` = rotated to the left.
   *
   * @default 0
   * @example 90
   */
  rotate?: number | null;
  /**
   * Page scale.
   *
   * @default 1
   * @example 0.5
   */
  scale?: number;
  unregisterPage?: undefined;
  /**
   * Page width. If neither `height` nor `width` are defined, page will be rendered at the size defined in PDF. If you define `width` and `height` at the same time, `height` will be ignored. If you define `width` and `scale` at the same time, the width will be multiplied by a given factor.
   *
   * @example 300
   */
  width?: number;
} & EventProps<PageCallback | false | undefined>;

/**
 * Displays a page.
 *
 * Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function, however some advanced functions like linking between pages inside a document may not be working correctly.
 */
export default function Page(props: PageProps): React.ReactElement {
  const documentContext = useDocumentContext();

  const mergedProps = { ...documentContext, ...props };
  const {
    _className = 'react-pdf__Page',
    _enableRegisterUnregisterPage = true,
    canvasBackground,
    canvasRef,
    children,
    className,
    customRenderer: CustomRenderer,
    customTextRenderer,
    devicePixelRatio,
    error = 'Failed to load the page.',
    height,
    inputRef,
    loading = 'Loading page…',
    noData = 'No page specified.',
    onGetAnnotationsError: onGetAnnotationsErrorProps,
    onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
    onGetStructTreeError: onGetStructTreeErrorProps,
    onGetStructTreeSuccess: onGetStructTreeSuccessProps,
    onGetTextError: onGetTextErrorProps,
    onGetTextSuccess: onGetTextSuccessProps,
    onLoadError: onLoadErrorProps,
    onLoadSuccess: onLoadSuccessProps,
    onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
    onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
    onRenderError: onRenderErrorProps,
    onRenderSuccess: onRenderSuccessProps,
    onRenderTextLayerError: onRenderTextLayerErrorProps,
    onRenderTextLayerSuccess: onRenderTextLayerSuccessProps,
    pageIndex: pageIndexProps,
    pageNumber: pageNumberProps,
    pdf,
    registerPage,
    renderAnnotationLayer: renderAnnotationLayerProps = true,
    renderForms = false,
    renderMode = 'canvas',
    renderTextLayer: renderTextLayerProps = true,
    rotate: rotateProps,
    scale: scaleProps = defaultScale,
    unregisterPage,
    width,
    ...otherProps
  } = mergedProps;

  const [pageState, pageDispatch] = useResolver<PDFPageProxy>();
  const { value: page, error: pageError } = pageState;
  const pageElement = useRef<HTMLDivElement>(null);

  invariant(
    pdf,
    'Attempted to load a page, but no document was specified. Wrap <Page /> in a <Document /> or pass explicit `pdf` prop.',
  );

  const pageIndex = isProvided(pageNumberProps) ? pageNumberProps - 1 : (pageIndexProps ?? null);

  const pageNumber = pageNumberProps ?? (isProvided(pageIndexProps) ? pageIndexProps + 1 : null);

  const rotate = rotateProps ?? (page ? page.rotate : null);

  const scale = useMemo(() => {
    if (!page) {
      return null;
    }

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // Passing scale explicitly null would cause the page not to render
    const scaleWithDefault = scaleProps ?? defaultScale;

    // If width/height is defined, calculate the scale of the page so it could be of desired width.
    if (width || height) {
      const viewport = page.getViewport({ scale: 1, rotation: rotate as number });
      if (width) {
        pageScale = width / viewport.width;
      } else if (height) {
        pageScale = height / viewport.height;
      }
    }

    return scaleWithDefault * pageScale;
  }, [height, page, rotate, scaleProps, width]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect intentionally triggered on pdf change
  useEffect(
    function hook() {
      return () => {
        if (!isProvided(pageIndex)) {
          // Impossible, but TypeScript doesn't know that
          return;
        }

        if (_enableRegisterUnregisterPage && unregisterPage) {
          unregisterPage(pageIndex);
        }
      };
    },
    [_enableRegisterUnregisterPage, pdf, pageIndex, unregisterPage],
  );

  /**
   * Called when a page is loaded successfully
   */
  function onLoadSuccess() {
    if (onLoadSuccessProps) {
      if (!page || !scale) {
        // Impossible, but TypeScript doesn't know that
        return;
      }

      onLoadSuccessProps(makePageCallback(page, scale));
    }

    if (_enableRegisterUnregisterPage && registerPage) {
      if (!isProvided(pageIndex) || !pageElement.current) {
        // Impossible, but TypeScript doesn't know that
        return;
      }

      registerPage(pageIndex, pageElement.current);
    }
  }

  /**
   * Called when a page failed to load
   */
  function onLoadError() {
    if (!pageError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, pageError.toString());

    if (onLoadErrorProps) {
      onLoadErrorProps(pageError);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect intentionally triggered on pdf and pageIndex change
  useEffect(
    function resetPage() {
      pageDispatch({ type: 'RESET' });
    },
    [pageDispatch, pdf, pageIndex],
  );

  useEffect(
    function loadPage() {
      if (!pdf || !pageNumber) {
        return;
      }

      const cancellable = makeCancellable(pdf.getPage(pageNumber));
      const runningTask = cancellable;

      cancellable.promise
        .then((nextPage) => {
          pageDispatch({ type: 'RESOLVE', value: nextPage });
        })
        .catch((error) => {
          pageDispatch({ type: 'REJECT', error });
        });

      return () => cancelRunningTask(runningTask);
    },
    [pageDispatch, pdf, pageNumber],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(() => {
    if (page === undefined) {
      return;
    }

    if (page === false) {
      onLoadError();
      return;
    }

    onLoadSuccess();
  }, [page, scale]);

  const childContext = useMemo(
    () =>
      // Technically there cannot be page without pageIndex, pageNumber, rotate and scale, but TypeScript doesn't know that
      isProvided(pageIndex) && pageNumber && isProvided(rotate) && isProvided(scale)
        ? {
            _className,
            canvasBackground,
            customTextRenderer,
            devicePixelRatio,
            onGetAnnotationsError: onGetAnnotationsErrorProps,
            onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
            onGetStructTreeError: onGetStructTreeErrorProps,
            onGetStructTreeSuccess: onGetStructTreeSuccessProps,
            onGetTextError: onGetTextErrorProps,
            onGetTextSuccess: onGetTextSuccessProps,
            onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
            onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
            onRenderError: onRenderErrorProps,
            onRenderSuccess: onRenderSuccessProps,
            onRenderTextLayerError: onRenderTextLayerErrorProps,
            onRenderTextLayerSuccess: onRenderTextLayerSuccessProps,
            page,
            pageIndex,
            pageNumber,
            renderForms,
            renderTextLayer: renderTextLayerProps,
            rotate,
            scale,
          }
        : null,
    [
      _className,
      canvasBackground,
      customTextRenderer,
      devicePixelRatio,
      onGetAnnotationsErrorProps,
      onGetAnnotationsSuccessProps,
      onGetStructTreeErrorProps,
      onGetStructTreeSuccessProps,
      onGetTextErrorProps,
      onGetTextSuccessProps,
      onRenderAnnotationLayerErrorProps,
      onRenderAnnotationLayerSuccessProps,
      onRenderErrorProps,
      onRenderSuccessProps,
      onRenderTextLayerErrorProps,
      onRenderTextLayerSuccessProps,
      page,
      pageIndex,
      pageNumber,
      renderForms,
      renderTextLayerProps,
      rotate,
      scale,
    ],
  );

  const eventProps = useMemo(
    () =>
      makeEventProps(otherProps, () =>
        page ? (scale ? makePageCallback(page, scale) : undefined) : page,
      ),
    // biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
    [otherProps, page, scale],
  );

  const pageKey = `${pageIndex}@${scale}/${rotate}`;

  function renderMainLayer() {
    switch (renderMode) {
      case 'custom': {
        invariant(
          CustomRenderer,
          `renderMode was set to "custom", but no customRenderer was passed.`,
        );

        return <CustomRenderer key={`${pageKey}_custom`} />;
      }
      case 'none':
        return null;
      case 'canvas':
      default:
        return <Canvas key={`${pageKey}_canvas`} canvasRef={canvasRef} />;
    }
  }

  function renderTextLayer() {
    if (!renderTextLayerProps) {
      return null;
    }

    return <TextLayer key={`${pageKey}_text`} />;
  }

  function renderAnnotationLayer() {
    if (!renderAnnotationLayerProps) {
      return null;
    }

    return <AnnotationLayer key={`${pageKey}_annotations`} />;
  }

  function renderChildren() {
    function isFulfilledContext(context: PageContextType): context is PageRenderProps {
      return Boolean(context?.page);
    }

    if (!isFulfilledContext(childContext)) {
      // Impossible, but TypeScript doesn't know that
      throw new Error('page is undefined');
    }

    const resolvedChildren = typeof children === 'function' ? children(childContext) : children;

    return (
      <PageContext.Provider value={childContext}>
        {renderMainLayer()}
        {renderTextLayer()}
        {renderAnnotationLayer()}
        {resolvedChildren}
      </PageContext.Provider>
    );
  }

  function renderContent() {
    if (!pageNumber) {
      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null || page === undefined || page === null) {
      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false || page === false) {
      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
    }

    return renderChildren();
  }

  return (
    <div
      className={clsx(_className, className)}
      data-page-number={pageNumber}
      // Assertion is needed for React 18 compatibility
      ref={mergeRefs(inputRef as React.Ref<HTMLDivElement>, pageElement)}
      style={
        {
          '--scale-round-x': '1px',
          '--scale-round-y': '1px',
          '--scale-factor': '1',
          '--user-unit': `${scale}`,
          '--total-scale-factor': 'calc(var(--scale-factor) * var(--user-unit))',
          backgroundColor: canvasBackground || 'white',
          position: 'relative',
          minWidth: 'min-content',
          minHeight: 'min-content',
        } as React.CSSProperties
      }
      {...eventProps}
    >
      {renderContent()}
    </div>
  );
}
