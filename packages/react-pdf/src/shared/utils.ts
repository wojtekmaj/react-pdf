import invariant from 'tiny-invariant';
import warning from 'warning';

import type { PDFPageProxy } from 'pdfjs-dist';
import type { PageCallback } from './types.js';

/**
 * Checks if we're running in a browser environment.
 */
export const isBrowser: boolean = typeof window !== 'undefined';

/**
 * Checks whether we're running from a local file system.
 */
export const isLocalFileSystem: boolean = isBrowser && window.location.protocol === 'file:';

/**
 * Checks whether a variable is defined.
 *
 * @param {*} variable Variable to check
 */
export function isDefined<T>(variable: T | undefined): variable is T {
  return typeof variable !== 'undefined';
}

/**
 * Checks whether a variable is defined and not null.
 *
 * @param {*} variable Variable to check
 */
export function isProvided<T>(variable: T | null | undefined): variable is T {
  return isDefined(variable) && variable !== null;
}

/**
 * Checks whether a variable provided is a string.
 *
 * @param {*} variable Variable to check
 */
export function isString(variable: unknown): variable is string {
  return typeof variable === 'string';
}

/**
 * Checks whether a variable provided is an ArrayBuffer.
 *
 * @param {*} variable Variable to check
 */
export function isArrayBuffer(variable: unknown): variable is ArrayBuffer {
  return variable instanceof ArrayBuffer;
}

/**
 * Checks whether a variable provided is a Blob.
 *
 * @param {*} variable Variable to check
 */
export function isBlob(variable: unknown): variable is Blob {
  invariant(isBrowser, 'isBlob can only be used in a browser environment');

  return variable instanceof Blob;
}

/**
 * Checks whether a variable provided is a data URI.
 *
 * @param {*} variable String to check
 */
export function isDataURI(variable: unknown): variable is `data:${string}` {
  return isString(variable) && /^data:/.test(variable);
}

export function dataURItoByteString(dataURI: unknown): string {
  invariant(isDataURI(dataURI), 'Invalid data URI.');

  const [headersString = '', dataString = ''] = dataURI.split(',');
  const headers = headersString.split(';');

  if (headers.indexOf('base64') !== -1) {
    return atob(dataString);
  }

  return unescape(dataString);
}

export function getDevicePixelRatio(): number {
  return (isBrowser && window.devicePixelRatio) || 1;
}

const allowFileAccessFromFilesTip =
  'On Chromium based browsers, you can use --allow-file-access-from-files flag for debugging purposes.';

export function displayCORSWarning(): void {
  warning(
    !isLocalFileSystem,
    `Loading PDF as base64 strings/URLs may not work on protocols other than HTTP/HTTPS. ${allowFileAccessFromFilesTip}`,
  );
}

export function displayWorkerWarning(): void {
  warning(
    !isLocalFileSystem,
    `Loading PDF.js worker may not work on protocols other than HTTP/HTTPS. ${allowFileAccessFromFilesTip}`,
  );
}

export function cancelRunningTask(runningTask?: { cancel?: () => void } | null): void {
  if (runningTask?.cancel) runningTask.cancel();
}

export function makePageCallback(page: PDFPageProxy, scale: number): PageCallback {
  Object.defineProperty(page, 'width', {
    get() {
      return this.view[2] * scale;
    },
    configurable: true,
  });
  Object.defineProperty(page, 'height', {
    get() {
      return this.view[3] * scale;
    },
    configurable: true,
  });
  Object.defineProperty(page, 'originalWidth', {
    get() {
      return this.view[2];
    },
    configurable: true,
  });
  Object.defineProperty(page, 'originalHeight', {
    get() {
      return this.view[3];
    },
    configurable: true,
  });
  return page as PageCallback;
}

export function isCancelException(error: Error): boolean {
  return error.name === 'RenderingCancelledException';
}

export function loadFromFile(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        return reject(new Error('Error while reading a file.'));
      }

      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = (event) => {
      if (!event.target) {
        return reject(new Error('Error while reading a file.'));
      }

      const { error } = event.target;

      if (!error) {
        return reject(new Error('Error while reading a file.'));
      }

      switch (error.code) {
        case error.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'));
        case error.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'));
        case error.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'));
        default:
          return reject(new Error('Error while reading a file.'));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// Get current browser
export function getBrowser() {
  var userAgent = navigator.userAgent;
  var browserName;

  if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    browserName = 'Samsung';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    browserName = 'IE';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
  } else {
    browserName = 'Unknown';
  }

  return browserName;
}

// reset text layer
export const resetTextLayer = (end: HTMLElement, textLayer: HTMLElement) => {
  if (getBrowser() === 'Firefox') {
    textLayer.append(end);
    end.style.width = '';
    end.style.height = '';
  }
  end.classList.remove('active');
};

// move .endOfContent to right after selection range
export const moveEndElementToSelectionEnd = (
  textLayers: Map<HTMLElement, HTMLElement>,
  prevRange?: Range,
) => {
  const selection = document.getSelection()!;

  const activeTextLayers = new Set();
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    for (const textLayerDiv of textLayers.keys()) {
      if (!activeTextLayers.has(textLayerDiv) && range.intersectsNode(textLayerDiv)) {
        activeTextLayers.add(textLayerDiv);
      }
    }
  }

  for (const [textLayerDiv, endDiv] of textLayers) {
    if (activeTextLayers.has(textLayerDiv)) {
      endDiv.classList.add('active');
    } else {
      resetTextLayer(endDiv, textLayerDiv);
    }
  }

  if (getBrowser() === 'Firefox') {
    return;
  }

  const range = selection.getRangeAt(0);
  const modifyStart =
    prevRange &&
    (range.compareBoundaryPoints(Range.END_TO_END, prevRange) === 0 ||
      range.compareBoundaryPoints(Range.START_TO_END, prevRange) === 0);
  let anchor = modifyStart ? range.startContainer : range.endContainer;
  if (anchor.nodeType === Node.TEXT_NODE) {
    anchor = anchor.parentNode!;
  }

  const parentTextLayer = anchor.parentElement!.closest('.textLayer') as HTMLDivElement;
  const endDiv = textLayers.get(parentTextLayer);
  if (endDiv && parentTextLayer) {
    endDiv.style.width = parentTextLayer.style.width;
    endDiv.style.height = parentTextLayer.style.height;
    anchor.parentElement!.insertBefore(endDiv, modifyStart ? anchor : anchor.nextSibling);
  }

  return range.cloneRange();
};
