import React from 'react';
import invariant from 'tiny-invariant';

import Page from './Page';

import { isProvided } from './shared/utils';

import useDocumentContext from './shared/hooks/useDocumentContext';

import type { PageProps } from './Page';

export type ThumbnailProps = Omit<
  PageProps,
  | 'customTextRenderer'
  | 'onClick'
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
>;

export default function Thumbnail(props: ThumbnailProps) {
  const { pageIndex: pageIndexProps, pageNumber: pageNumberProps } = props;

  const documentContext = useDocumentContext();

  invariant(
    documentContext,
    'Unable to find Document context. Did you wrap <Page /> in <Document />?',
  );

  const { linkService } = documentContext;

  const pageNumber = pageNumberProps ?? (isProvided(pageIndexProps) ? pageIndexProps + 1 : null);

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (!pageNumber) {
      return;
    }

    linkService.goToPage(pageNumber);
  }

  return (
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <a href={pageNumber ? '#' : undefined} onClick={onClick}>
      <Page
        {...props}
        _className="react-pdf__Thumbnail"
        _enableRegisterUnregisterPage={false}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </a>
  );
}
