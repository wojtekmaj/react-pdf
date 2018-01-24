import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Ref from './Ref';

import { callIfDefined, isDefined } from './shared/utils';

import { isPdf } from './shared/propTypes';

export default class OutlineItem extends Component {
  getDestination = async () => {
    const { pdf } = this.context;
    const { item } = this.props;

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
    const { pdf } = this.context;

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
    event.preventDefault();

    const pageIndex = await this.getPageIndex();
    const pageNumber = await this.getPageNumber();

    callIfDefined(
      this.context.onClick,
      {
        pageIndex,
        pageNumber,
      },
    );
  }

  renderSubitems() {
    const { item } = this.props;

    if (!item.items || !item.items.length) {
      return null;
    }

    const { items: subitems } = item;

    return (
      <ul>
        {
          subitems.map((subitem, subitemIndex) => (
            <OutlineItem
              key={
                typeof subitem.destination === 'string' ?
                  subitem.destination :
                  subitemIndex
              }
              item={subitem}
            />
          ))
        }
      </ul>
    );
  }

  render() {
    const { item } = this.props;
    const { onClick } = this;

    return (
      <li>
        <a
          href="#"
          onClick={onClick}
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

OutlineItem.contextTypes = {
  onClick: PropTypes.func,
  pdf: isPdf.isRequired,
};

OutlineItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    destination: isDestination,
    items: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      destination: isDestination,
    })),
  }).isRequired,
};
