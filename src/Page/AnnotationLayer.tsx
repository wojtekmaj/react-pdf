import React, { useEffect, useMemo, useRef } from 'react';
import makeCancellable from 'make-cancellable-promise';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist';

import useDocumentContext from '../shared/hooks/useDocumentContext';
import usePageContext from '../shared/hooks/usePageContext';
import useResolver from '../shared/hooks/useResolver';
import { cancelRunningTask } from '../shared/utils';

import type { Annotations } from '../shared/types';

export default function AnnotationLayer() {
  const documentContext = useDocumentContext();

  invariant(
    documentContext,
    'Unable to find Document context. Did you wrap <Page /> in <Document />?',
  );

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

  const [annotationsState, annotationsDispatch] = useResolver<Annotations>();
  const { value: annotations, error: annotationsError } = annotationsState;
  const layerElement = useRef<HTMLDivElement>(null);

  invariant(page, 'Attempted to load page annotations, but no page was specified.');

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
    if (!pdf || !page || !annotations) {
      return;
    }

    const { current: layer } = layerElement;

    if (!layer) {
      return;
    }

    const clonedViewport = viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      annotationStorage: pdf.annotationStorage,
      div: layer,
      downloadManager: null,
      imageResourcesPath,
      linkService,
      page,
      renderForms,
      viewport: clonedViewport,
    };

    layer.innerHTML = '';

    try {
      pdfjs.AnnotationLayer.render(parameters);

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
