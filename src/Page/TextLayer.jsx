import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

import PageContext from '../PageContext';

import { cancelRunningTask } from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export function TextLayerInternal({
  customTextRenderer,
  onGetTextError,
  onGetTextSuccess,
  onRenderTextLayerError,
  onRenderTextLayerSuccess,
  page,
  pageIndex,
  pageNumber,
  rotate: rotateProps,
  scale,
}) {
  const [textContent, setTextContent] = useState(null);
  const layerElement = useRef();
  const endElement = useRef();

  invariant(page, 'Attempted to load page text content, but no page was specified.');

  warning(
    parseInt(
      window.getComputedStyle(document.body).getPropertyValue('--react-pdf-text-layer'),
      10,
    ) === 1,
    'TextLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-text-layer',
  );

  /**
   * Called when a page text content is read successfully
   */
  const onLoadSuccess = useCallback(
    (nextTextContent) => {
      if (onGetTextSuccess) {
        onGetTextSuccess(nextTextContent);
      }
    },
    [onGetTextSuccess],
  );
  /**
   * Called when a page text content failed to read successfully
   */
  const onLoadError = useCallback(
    (error) => {
      setTextContent(false);

      warning(false, error);

      if (onGetTextError) {
        onGetTextError(error);
      }
    },
    [onGetTextError],
  );

  function resetTextContent() {
    setTextContent(null);
  }

  useEffect(resetTextContent, [page]);

  function loadTextContent() {
    const cancellable = makeCancellable(page.getTextContent());
    const runningTask = cancellable;

    cancellable.promise
      .then((nextTextContent) => {
        setTextContent(nextTextContent);

        // Waiting for textContent to be set in state
        setTimeout(() => {
          onLoadSuccess(nextTextContent);
        }, 0);
      })
      .catch(onLoadError);

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadTextContent, [onLoadError, onLoadSuccess, page]);

  /**
   * Called when a text layer is rendered successfully
   */
  const onRenderSuccess = useCallback(() => {
    if (onRenderTextLayerSuccess) {
      onRenderTextLayerSuccess();
    }
  }, [onRenderTextLayerSuccess]);

  /**
   * Called when a text layer failed to render successfully
   */
  const onRenderError = useCallback(
    (error) => {
      warning(false, error);

      if (onRenderTextLayerError) {
        onRenderTextLayerError(error);
      }
    },
    [onRenderTextLayerError],
  );

  function onMouseDown() {
    const end = endElement.current;

    if (!end) {
      return;
    }

    end.classList.add('active');
  }

  function onMouseUp() {
    const end = endElement.current;

    if (!end) {
      return;
    }

    end.classList.remove('active');
  }

  const viewport = useMemo(
    () => page.getViewport({ scale, rotation: rotateProps }),
    [page, rotateProps, scale],
  );

  function renderTextLayer() {
    if (!textContent) {
      return;
    }

    const container = layerElement.current;

    container.innerHTML = '';

    const parameters = {
      container,
      textContent,
      viewport,
    };

    const cancellable = pdfjs.renderTextLayer(parameters);
    const runningTask = cancellable;

    cancellable.promise
      .then(() => {
        const end = document.createElement('div');
        end.className = 'endOfContent';
        container.append(end);
        endElement.current = end;

        if (customTextRenderer) {
          let index = 0;
          textContent.items.forEach((item, itemIndex) => {
            const child = layerElement.current.children[index];

            const content = customTextRenderer({
              pageIndex,
              pageNumber,
              itemIndex,
              ...item,
            });

            child.innerHTML = content;
            index += item.str && item.hasEOL ? 2 : 1;
          });
        }

        // Intentional immediate callback
        onRenderSuccess();
      })
      .catch(onRenderError);

    return () => cancelRunningTask(runningTask);
  }

  useLayoutEffect(renderTextLayer, [
    customTextRenderer,
    onRenderError,
    onRenderSuccess,
    pageIndex,
    pageNumber,
    textContent,
    viewport,
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="react-pdf__Page__textContent textLayer"
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      ref={layerElement}
    />
  );
}

TextLayerInternal.propTypes = {
  customTextRenderer: PropTypes.func,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onRenderTextLayerError: PropTypes.func,
  onRenderTextLayerSuccess: PropTypes.func,
  page: isPage.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageNumber: PropTypes.number.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

export default function TextLayer(props) {
  return (
    <PageContext.Consumer>
      {(context) => <TextLayerInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
