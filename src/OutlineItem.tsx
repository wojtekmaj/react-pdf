import React, { useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import invariant from 'tiny-invariant';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import Ref from './Ref';

import { isDefined } from './shared/utils';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { RefProxy } from 'pdfjs-dist/types/src/display/api';

function useCachedValue<T>(getter: () => T): () => T {
  const ref = useRef<T>();

  const currentValue = ref.current;

  if (isDefined(currentValue)) {
    return () => currentValue;
  }

  return () => {
    const value = getter();

    ref.current = value;

    return value;
  };
}

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

type PDFOutlineItem = PDFOutline[number];

type OutlineItemProps = {
  item: PDFOutlineItem;
};

export default function OutlineItem(props: OutlineItemProps) {
  const documentContext = useContext(DocumentContext);

  invariant(
    documentContext,
    'Unable to find Document context. Did you wrap <Outline /> in <Document />?',
  );

  const outlineContext = useContext(OutlineContext);

  invariant(outlineContext, 'Unable to find Outline context.');

  const mergedProps = { ...documentContext, ...outlineContext, ...props };
  const { item, onClick: onClickProps, pdf, ...otherProps } = mergedProps;

  invariant(pdf, 'Attempted to load an outline, but no document was specified.');

  const getDestination = useCachedValue(() => {
    if (typeof item.dest === 'string') {
      return pdf.getDestination(item.dest);
    }

    return item.dest;
  });

  const getPageIndex = useCachedValue(async () => {
    const destination = await getDestination();

    if (!destination) {
      throw new Error('Destination not found.');
    }

    const [ref] = destination as [RefProxy];

    return pdf.getPageIndex(new Ref(ref));
  });

  const getPageNumber = useCachedValue(async () => {
    const pageIndex = await getPageIndex();

    return pageIndex + 1;
  });

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (!onClickProps) {
      return false;
    }

    return Promise.all([getDestination(), getPageIndex(), getPageNumber()]).then(
      ([dest, pageIndex, pageNumber]) => {
        onClickProps({
          dest,
          pageIndex,
          pageNumber,
        });
      },
    );
  }

  function renderSubitems() {
    if (!item.items || !item.items.length) {
      return null;
    }

    const { items: subitems } = item;

    return (
      <ul>
        {subitems.map((subitem, subitemIndex) => (
          <OutlineItem
            key={typeof subitem.dest === 'string' ? subitem.dest : subitemIndex}
            item={subitem}
            {...otherProps}
          />
        ))}
      </ul>
    );
  }

  return (
    <li>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" onClick={onClick}>
        {item.title}
      </a>
      {renderSubitems()}
    </li>
  );
}

const isDestination = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.any)]);

OutlineItem.propTypes = {
  item: PropTypes.shape({
    dest: isDestination,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        dest: isDestination,
        title: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
  }).isRequired,
};
