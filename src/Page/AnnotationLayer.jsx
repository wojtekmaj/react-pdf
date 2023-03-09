import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';

import { cancelRunningTask } from '../shared/utils';

import { isLinkService, isPage, isRotate } from '../shared/propTypes';

export function AnnotationLayerInternal({
  imageResourcesPath,
  linkService,
  onGetAnnotationsError: onGetAnnotationsErrorProps,
  onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
  onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
  onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
  page,
  renderForms,
  rotate: rotateProps,
  scale = 1,
}) {
  const [annotations, setAnnotations] = useState(null);
  const layerElement = useRef();

  invariant(page, 'Attempted to load page annotations, but no page was specified.');

  warning(
    parseInt(
      window.getComputedStyle(document.body).getPropertyValue('--react-pdf-annotation-layer'),
      10,
    ) === 1,
    'AnnotationLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-annotations',
  );

  const onLoadSuccess = useCallback(
    (nextAnnotations) => {
      if (onGetAnnotationsSuccessProps) {
        onGetAnnotationsSuccessProps(nextAnnotations);
      }
    },
    [onGetAnnotationsSuccessProps],
  );

  const onLoadError = useCallback(
    (error) => {
      setAnnotations(false);

      warning(false, error);

      if (onGetAnnotationsErrorProps) onGetAnnotationsErrorProps(error);
    },
    [onGetAnnotationsErrorProps],
  );

  function resetAnnotations() {
    setAnnotations(null);
  }

  useEffect(resetAnnotations, [page]);

  function loadAnnotations() {
    const cancellable = makeCancellable(page.getAnnotations());
    const runningTask = cancellable;

    cancellable.promise
      .then((nextAnnotations) => {
        setAnnotations(nextAnnotations);

        // Waiting for annotations to be set in state
        setTimeout(() => {
          onLoadSuccess(nextAnnotations);
        }, 0);
      })
      .catch(onLoadError);

    return () => {
      cancelRunningTask(runningTask);
    };
  }

  useEffect(loadAnnotations, [page, onLoadError, onLoadSuccess, renderForms]);

  const onRenderSuccess = useCallback(() => {
    if (onRenderAnnotationLayerSuccessProps) {
      onRenderAnnotationLayerSuccessProps();
    }
  }, [onRenderAnnotationLayerSuccessProps]);

  const onRenderError = useCallback(
    (error) => {
      warning(false, error);
      if (onRenderAnnotationLayerErrorProps) {
        onRenderAnnotationLayerErrorProps(error);
      }
    },
    [onRenderAnnotationLayerErrorProps],
  );

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotateProps }),
    [page, rotateProps, scale],
  );

  function renderAnnotationLayer() {
    if (!annotations) {
      return;
    }

    const { current: layer } = layerElement;

    if (!layer) {
      return null;
    }

    const clonedViewport = viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: layer,
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

  useEffect(renderAnnotationLayer, [
    annotations,
    imageResourcesPath,
    linkService,
    onRenderError,
    onRenderSuccess,
    page,
    renderForms,
    viewport,
  ]);

  return <div className="react-pdf__Page__annotations annotationLayer" ref={layerElement} />;
}

AnnotationLayerInternal.propTypes = {
  imageResourcesPath: PropTypes.string,
  linkService: isLinkService.isRequired,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
  onRenderAnnotationLayerError: PropTypes.func,
  onRenderAnnotationLayerSuccess: PropTypes.func,
  page: isPage,
  renderForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
};

AnnotationLayerInternal.defaultProps = {
  // Can be moved to Page.defaultProps after renderInteractiveForms is removed
  renderForms: false,
  scale: 1,
};

const AnnotationLayer = (props) => (
  <DocumentContext.Consumer>
    {(documentContext) => (
      <PageContext.Consumer>
        {(pageContext) => (
          <AnnotationLayerInternal {...documentContext} {...pageContext} {...props} />
        )}
      </PageContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default AnnotationLayer;
