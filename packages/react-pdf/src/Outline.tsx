'use client';

import { useCallback, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import makeEventProps from 'make-event-props';
import invariant from 'tiny-invariant';
import warning from 'warning';

import OutlineContext from './OutlineContext.js';
import OutlineItem from './OutlineItem.js';

import useDocumentContext from './shared/hooks/useDocumentContext.js';
import useResource from './shared/hooks/useResource.js';

import ResourceCache from './shared/ResourceCache.js';

import type { EventProps } from 'make-event-props';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ClassName, OnItemClickArgs } from './shared/types.js';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

const outlineCaches = new WeakMap<
  PDFDocumentProxy,
  ResourceCache<[PDFDocumentProxy], PDFOutline>
>();

function getOutlineCache(pdf: PDFDocumentProxy): ResourceCache<[PDFDocumentProxy], PDFOutline> {
  let cache = outlineCaches.get(pdf);

  if (!cache) {
    cache = new ResourceCache({ cacheResolved: true });
    outlineCaches.set(pdf, cache);
  }

  return cache;
}

export type OutlineProps = {
  /**
   * Class name(s) that will be added to rendered element along with the default `react-pdf__Outline`.
   *
   * @example 'custom-class-name-1 custom-class-name-2'
   * @example ['custom-class-name-1', 'custom-class-name-2']
   */
  className?: ClassName;
  /**
   * A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Outline>` component.
   *
   * @example (ref) => { this.myOutline = ref; }
   * @example this.ref
   * @example ref
   */
  inputRef?: React.Ref<HTMLDivElement>;
  /**
   * Function called when an outline item has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.
   *
   * @example ({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')
   */
  onItemClick?: (props: OnItemClickArgs) => void;
  /**
   * Function called in case of an error while retrieving the outline.
   *
   * @example (error) => alert('Error while retrieving the outline! ' + error.message)
   */
  onLoadError?: (error: Error) => void;
  /**
   * Function called when the outline is successfully retrieved.
   *
   * @example (outline) => alert('The outline has been successfully retrieved.')
   */
  onLoadSuccess?: (outline: PDFOutline | null) => void;
  pdf?: PDFDocumentProxy | false;
  /**
   * Whether loading suspends and errors propagate to the nearest Error Boundary.
   * Set to `false` to use the component's loading and error behavior instead.
   * Inherits from Document when omitted on a child component.
   *
   * @default true
   */
  suspense?: boolean;
} & EventProps<PDFOutline | null | false | undefined>;

/**
 * Displays an outline (table of contents).
 *
 * Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.
 */
export default function Outline(props: OutlineProps): React.ReactElement | null {
  const documentContext = useDocumentContext();

  const mergedProps = { ...documentContext, ...props };
  const {
    className,
    inputRef,
    onItemClick,
    onLoadError: onLoadErrorProps,
    onLoadSuccess: onLoadSuccessProps,
    pdf,
    suspense = true,
    ...otherProps
  } = mergedProps;

  invariant(
    pdf,
    'Attempted to load an outline, but no document was specified. Wrap <Outline /> in a <Document /> or pass explicit `pdf` prop.',
  );

  const loadOutline = useCallback(() => ({ promise: pdf.getOutline() }), [pdf]);
  const { value: outline, error: outlineError } = useResource(
    { cache: getOutlineCache(pdf), key: [pdf], load: loadOutline },
    suspense,
    onLoadErrorProps,
  );

  /**
   * Called when an outline is read successfully
   */
  function onLoadSuccess() {
    if (typeof outline === 'undefined' || outline === false) {
      return;
    }

    if (onLoadSuccessProps) {
      onLoadSuccessProps(outline);
    }
  }

  /**
   * Called when an outline failed to read successfully
   */
  function onLoadError() {
    if (!outlineError) {
      // Impossible, but TypeScript doesn't know that
      return;
    }

    warning(false, outlineError.toString());

    if (onLoadErrorProps) {
      onLoadErrorProps(outlineError);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Omitted callbacks so they are not called every time they change
  useEffect(() => {
    if (outline === undefined) {
      return;
    }

    if (outline === false) {
      onLoadError();
      return;
    }

    onLoadSuccess();
  }, [outline]);

  const childContext = useMemo(
    () => ({
      onItemClick,
    }),
    [onItemClick],
  );

  const eventProps = useMemo(
    () => makeEventProps(otherProps, () => outline),
    // biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
    [otherProps, outline],
  );

  if (!outline) {
    return null;
  }

  function renderOutline() {
    if (!outline) {
      return null;
    }

    return (
      <ul>
        {outline.map((item, itemIndex) => (
          <OutlineItem
            key={typeof item.dest === 'string' ? item.dest : itemIndex}
            item={item}
            pdf={pdf}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className={clsx('react-pdf__Outline', className)} ref={inputRef} {...eventProps}>
      <OutlineContext.Provider value={childContext}>{renderOutline()}</OutlineContext.Provider>
    </div>
  );
}
