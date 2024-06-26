'use client';

import clsx from 'clsx';
import invariant from 'tiny-invariant';

import Page from './Page.js';

import { isProvided } from './shared/utils.js';

import useDocumentContext from './shared/hooks/useDocumentContext.js';

import type { PageProps } from './Page.js';
import type { ClassName, OnItemClickArgs } from './shared/types.js';

export type ThumbnailProps = Omit<
  PageProps,
  | 'className'
  | 'customTextRenderer'
  | 'onGetAnnotationsError'
  | 'onGetAnnotationsSuccess'
  | 'onGetTextError'
  | 'onGetTextSuccess'
  | 'onRenderAnnotationLayerError'
  | 'onRenderAnnotationLayerSuccess'
  | 'onRenderTextLayerError'
  | 'onRenderTextLayerSuccess'
  | 'renderAnnotationLayer'
  | 'renderForms'
  | 'renderTextLayer'
> & {
  /**
   * Class name(s) that will be added to rendered element along with the default `react-pdf__Thumbnail`.
   *
   * @example 'custom-class-name-1 custom-class-name-2'
   * @example ['custom-class-name-1', 'custom-class-name-2']
   */
  className?: ClassName;
  /**
   * Function called when a thumbnail has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.
   *
   * @example ({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')
   */
  onItemClick?: (args: OnItemClickArgs) => void;
};

/**
 * Displays a thumbnail of a page. Does not render the annotation layer or the text layer. Does not register itself as a link target, so the user will not be scrolled to a Thumbnail component when clicked on an internal link (e.g. in Table of Contents). When clicked, attempts to navigate to the page clicked (similarly to a link in Outline).
 *
 * Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.
 */
export default function Thumbnail(props: ThumbnailProps): React.ReactElement {
  const documentContext = useDocumentContext();

  const mergedProps = { ...documentContext, ...props };
  const {
    className,
    linkService,
    onItemClick,
    pageIndex: pageIndexProps,
    pageNumber: pageNumberProps,
    pdf,
  } = mergedProps;

  invariant(
    pdf,
    'Attempted to load a thumbnail, but no document was specified. Wrap <Thumbnail /> in a <Document /> or pass explicit `pdf` prop.',
  );

  const pageIndex = isProvided(pageNumberProps) ? pageNumberProps - 1 : pageIndexProps ?? null;

  const pageNumber = pageNumberProps ?? (isProvided(pageIndexProps) ? pageIndexProps + 1 : null);

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (!isProvided(pageIndex) || !pageNumber) {
      return;
    }

    invariant(
      onItemClick || linkService,
      'Either onItemClick callback or linkService must be defined in order to navigate to an outline item.',
    );

    if (onItemClick) {
      onItemClick({
        pageIndex,
        pageNumber,
      });
    } else if (linkService) {
      linkService.goToPage(pageNumber);
    }
  }

  const { className: classNameProps, onItemClick: onItemClickProps, ...pageProps } = props;

  return (
    <a
      className={clsx('react-pdf__Thumbnail', className)}
      href={pageNumber ? '#' : undefined}
      onClick={onClick}
    >
      <Page
        {...pageProps}
        _className="react-pdf__Thumbnail__page"
        _enableRegisterUnregisterPage={false}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </a>
  );
}
