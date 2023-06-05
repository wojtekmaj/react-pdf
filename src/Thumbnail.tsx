import React from 'react';
import invariant from 'tiny-invariant';

import Page from './Page';

import { isProvided } from './shared/utils';

import useDocumentContext from './shared/hooks/useDocumentContext';

import type { PageProps } from './Page';

export type ThumbnailProps = Omit<
  PageProps,
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

  if (!pageNumber) {
    throw new Error('Attempted to load a Thumbnail, but no pageNumber was specified.');
  }

  return (
    <Page
      {...props}
      _className="react-pdf__Thumbnail"
      _enableRegisterUnregisterPage={false}
      onClick={() => {
        linkService.goToPage(pageNumber);
      }}
      renderAnnotationLayer={false}
      renderTextLayer={false}
    />
  );
}
