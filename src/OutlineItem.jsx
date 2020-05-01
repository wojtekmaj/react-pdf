import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import Ref from './Ref';

import { isDefined } from './shared/utils';

import { isPdf } from './shared/propTypes';

export class OutlineItemInternal extends PureComponent {
  getDestination = async () => {
    const { item, pdf } = this.props;

    if (!isDefined(this.destination)) {
      if (typeof item.dest === 'string') {
        this.destination = await pdf.getDestination(item.dest);
      } else {
        this.destination = item.dest;
      }
    }

    return this.destination;
  }

  getPageIndex = async () => {
    const { pdf } = this.props;

    if (!isDefined(this.pageIndex)) {
      const destination = await this.getDestination();
      if (destination) {
        const [ref] = destination;
        this.pageIndex = await pdf.getPageIndex(new Ref(ref));
      }
    }

    return this.pageIndex;
  }

  getPageNumber = async () => {
    if (!isDefined(this.pageNumber)) {
      this.pageNumber = await this.getPageIndex() + 1;
    }

    return this.pageNumber;
  }

  onClick = async (event) => {
    const { onClick } = this.props;

    event.preventDefault();

    const pageIndex = await this.getPageIndex();
    const pageNumber = await this.getPageNumber();

    if (onClick) {
      onClick({
        pageIndex,
        pageNumber,
      });
    }
  }

  renderSubitems() {
    const { item, ...otherProps } = this.props;

    if (!item.items || !item.items.length) {
      return null;
    }

    const { items: subitems } = item;

    return (
      <ul>
        {
          subitems.map((subitem, subitemIndex) => (
            <OutlineItemInternal
              key={
                typeof subitem.destination === 'string'
                  ? subitem.destination
                  : subitemIndex
              }
              item={subitem}
              {...otherProps}
            />
          ))
        }
      </ul>
    );
  }

  render() {
    const { item } = this.props;

    /* eslint-disable jsx-a11y/anchor-is-valid */
    return (
      <li>
        <a
          href="#"
          onClick={this.onClick}
        >
          {item.title}
        </a>
        {this.renderSubitems()}
      </li>
    );
  }
}

const isDestination = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.any),
]);

OutlineItemInternal.propTypes = {
  item: PropTypes.shape({
    dest: isDestination,
    items: PropTypes.arrayOf(PropTypes.shape({
      dest: isDestination,
      title: PropTypes.string,
    })),
    title: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  pdf: isPdf.isRequired,
};

const OutlineItem = props => (
  <DocumentContext.Consumer>
    {documentContext => (
      <OutlineContext.Consumer>
        {outlineContext => (
          <OutlineItemInternal {...documentContext} {...outlineContext} {...props} />
        )}
      </OutlineContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default OutlineItem;
