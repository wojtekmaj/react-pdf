import invariant from 'tiny-invariant';

import Ref from './Ref.js';

import useCachedValue from './shared/hooks/useCachedValue.js';
import useDocumentContext from './shared/hooks/useDocumentContext.js';
import useOutlineContext from './shared/hooks/useOutlineContext.js';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { RefProxy } from 'pdfjs-dist/types/src/display/api.js';

type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;

type PDFOutlineItem = PDFOutline[number];

type OutlineItemProps = {
  item: PDFOutlineItem;
  pdf?: PDFDocumentProxy | false;
};

export default function OutlineItem(props: OutlineItemProps) {
  const documentContext = useDocumentContext();

  const outlineContext = useOutlineContext();

  invariant(outlineContext, 'Unable to find Outline context.');

  const mergedProps = { ...documentContext, ...outlineContext, ...props };
  const { item, linkService, onItemClick, pdf, ...otherProps } = mergedProps;

  invariant(
    pdf,
    'Attempted to load an outline, but no document was specified. Wrap <Outline /> in a <Document /> or pass explicit `pdf` prop.',
  );

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

    invariant(
      onItemClick || linkService,
      'Either onItemClick callback or linkService must be defined in order to navigate to an outline item.',
    );

    if (onItemClick) {
      Promise.all([getDestination(), getPageIndex(), getPageNumber()]).then(
        ([dest, pageIndex, pageNumber]) => {
          onItemClick({
            dest,
            pageIndex,
            pageNumber,
          });
        },
      );
    } else if (linkService) {
      linkService.goToDestination(item.dest);
    }
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
            pdf={pdf}
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
