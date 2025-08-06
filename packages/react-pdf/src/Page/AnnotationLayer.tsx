'use client';

import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import makeCancellable from 'make-cancellable-promise';
import * as pdfjs from 'pdfjs-dist';
import invariant from 'tiny-invariant';
import warning from 'warning';

import useDocumentContext from '../shared/hooks/useDocumentContext.js';
import usePageContext from '../shared/hooks/usePageContext.js';
import useResolver from '../shared/hooks/useResolver.js';

import { cancelRunningTask } from '../shared/utils.js';

import type { AnnotationLayerParameters } from 'pdfjs-dist/types/src/display/annotation_layer.js';
import type { Annotations } from '../shared/types.js';

export default function AnnotationLayer(): React.ReactElement {
  const documentContext = useDocumentContext();
  const pageContext = usePageContext();

  invariant(pageContext, 'Unable to find Page context.');

  const mergedProps = { ...documentContext, ...pageContext };
  const {
    imageResourcesPath,
    linkService,
    onGetAnnotationsError: onGetAnnotationsErrorProps,
    onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
    onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
    onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
    page,
    pdf,
    renderForms,
    rotate,
    scale = 1,
  } = mergedProps;

  invariant(
    pdf,
    'Attempted to load page annotations, but no document was specified. Wrap <Page /> in a <Document /> or pass explicit `pdf` prop.',
  );
  invariant(page, 'Attempted to load page annotations, but no page was specified.');
  invariant(linkService, 'Attempted to load page annotations, but no linkService was specified.');

  const [annotationsState, annotationsDispatch] = useResolver<Annotations>();
  const { value: annotations, error: annotationsError } = annotationsState;
  const layerElement = useRef<HTMLDivElement>(null);

  warning(
    Number.parseInt(
      window.getComputedStyle(document.body).getPropertyValue('--react-pdf-annotation-layer'),
      10,
    ) === 1,
    'AnnotationLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-annotations',
  );

  function onLoadSuccess() {
    if (!annotations) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    if (onGetAnnotationsSuccessProps) {
      onGetAnnotationsSuccessProps(annotations);
    }
  }

  function onLoadError() {
    if (!annotationsError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, annotationsError.toString());

    if (onGetAnnotationsErrorProps) {
      onGetAnnotationsErrorProps(annotationsError);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect intentionally triggered on page change
  useEffect(
    function resetAnnotations() {
      annotationsDispatch({ type: 'RESET' });
    },
    [annotationsDispatch, page],
  );

  useEffect(
    function loadAnnotations() {
      if (!page) {
        return;
      }

      const cancellable = makeCancellable(page.getAnnotations());
      const runningTask = cancellable;

      cancellable.promise
        .then((nextAnnotations) => {
          annotationsDispatch({ type: 'RESOLVE', value: nextAnnotations });
        })
        .catch((error) => {
          annotationsDispatch({ type: 'REJECT', error });
        });

      return () => {
        cancelRunningTask(runningTask);
      };
    },
    [annotationsDispatch, page],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(() => {
    if (annotations === undefined) {
      return;
    }

    if (annotations === false) {
      onLoadError();
      return;
    }

    onLoadSuccess();
  }, [annotations]);

  function onRenderSuccess() {
    if (onRenderAnnotationLayerSuccessProps) {
      onRenderAnnotationLayerSuccessProps();
    }
  }

  function onRenderError(error: unknown) {
    warning(false, `${error}`);

    if (onRenderAnnotationLayerErrorProps) {
      onRenderAnnotationLayerErrorProps(error);
    }
  }

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotate }),
    [page, rotate, scale],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(
    function renderAnnotationLayer() {
      if (!pdf || !page || !linkService || !annotations) {
        return;
      }

      const { current: layer } = layerElement;

      if (!layer) {
        return;
      }

      const clonedViewport = viewport.clone({ dontFlip: true });

      const annotationLayerParameters = {
        accessibilityManager: null, // TODO: Implement this
        annotationCanvasMap: null, // TODO: Implement this
        annotationEditorUIManager: null, // TODO: Implement this
        div: layer,
        l10n: null, // TODO: Implement this
        page,
        structTreeLayer: null, // TODO: Implement this
        viewport: clonedViewport,
      };

      const renderParameters: AnnotationLayerParameters = {
        annotations,
        annotationStorage: pdf.annotationStorage,
        div: layer,
        imageResourcesPath,
        linkService,
        page,
        renderForms,
        viewport: clonedViewport,
      };

      layer.innerHTML = '';

      try {
        new pdfjs.AnnotationLayer(annotationLayerParameters).render(renderParameters);

        // Intentional immediate callback
        onRenderSuccess();
      } catch (error) {
        onRenderError(error);
      }

      return () => {
        // TODO: Cancel running task?
      };
    },
    [annotations, imageResourcesPath, linkService, page, pdf, renderForms, viewport],
  );

  return (
    <div className={clsx('react-pdf__Page__annotations', 'annotationLayer')} ref={layerElement} />
  );
}
