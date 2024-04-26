'use client';

import { useEffect, useMemo, useRef } from 'react';
import makeCancellable from 'make-cancellable-promise';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'warning';
import pdfjs from '../pdfjs.js';

import useDocumentContext from '../shared/hooks/useDocumentContext.js';
import usePageContext from '../shared/hooks/usePageContext.js';
import useResolver from '../shared/hooks/useResolver.js';
import { cancelRunningTask } from '../shared/utils.js';

import type { IDownloadManager } from 'pdfjs-dist/types/web/interfaces.js';
import type { Annotations } from '../shared/types.js';

export default function AnnotationLayer() {
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
    parseInt(
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

  function resetAnnotations() {
    annotationsDispatch({ type: 'RESET' });
  }

  useEffect(resetAnnotations, [annotationsDispatch, page]);

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
  }

  useEffect(loadAnnotations, [annotationsDispatch, page, renderForms]);

  useEffect(
    () => {
      if (annotations === undefined) {
        return;
      }

      if (annotations === false) {
        onLoadError();
        return;
      }

      onLoadSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations],
  );

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
      div: layer,
      l10n: null, // TODO: Implement this
      page,
      viewport: clonedViewport,
    };

    const renderParameters = {
      annotations,
      annotationStorage: pdf.annotationStorage,
      div: layer,
      // See https://github.com/mozilla/pdf.js/issues/17029
      downloadManager: null as unknown as IDownloadManager,
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
  }

  useEffect(
    renderAnnotationLayer,
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations, imageResourcesPath, linkService, page, renderForms, viewport],
  );

  return (
    <div className={clsx('react-pdf__Page__annotations', 'annotationLayer')} ref={layerElement} />
  );
}
