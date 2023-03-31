import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';

import PageContext from '../PageContext';

import { cancelRunningTask } from '../shared/utils';

export default function TextLayer() {
  const context = useContext(PageContext);
  const mergedProps = { ...context };
  const {
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
  } = mergedProps;

  const [textContent, setTextContent] = useState(undefined);
  const [textContentError, setTextContentError] = useState(undefined);
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
  function onLoadSuccess() {
    if (onGetTextSuccess) {
      onGetTextSuccess(textContent);
    }
  }

  /**
   * Called when a page text content failed to read successfully
   */
  function onLoadError() {
    warning(false, textContentError);

    if (onGetTextError) {
      onGetTextError(textContentError);
    }
  }

  function resetTextContent() {
    setTextContent(undefined);
    setTextContentError(undefined);
  }

  useEffect(resetTextContent, [page]);

  function loadTextContent() {
    const cancellable = makeCancellable(page.getTextContent());
    const runningTask = cancellable;

    cancellable.promise.then(setTextContent).catch((error) => {
      setTextContent(false);
      setTextContentError(error);
    });

    return () => cancelRunningTask(runningTask);
  }

  useEffect(loadTextContent, [page]);

  useEffect(
    () => {
      if (textContent === undefined) {
        return;
      }

      if (textContent === false) {
        onLoadError();
        return;
      }

      onLoadSuccess();
    },
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textContent],
  );

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

    const textContentSource = page.streamTextContent();

    const parameters = {
      container,
      textContentSource,
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
    page,
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
