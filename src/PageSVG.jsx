import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { callIfDefined } from './shared/util';

import { isPage, isRotate } from './shared/propTypes';

export default class PageSVG extends Component {
  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess = () => {
    this.renderer = null;

    callIfDefined(this.props.onRenderSuccess);
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if (error.name === 'RenderingCancelledException') {
      return;
    }

    callIfDefined(
      this.props.onRenderError,
      error,
    );
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport(scale, rotate);
  }

  drawPageOnContainer = (element) => {
    if (!element) {
      return null;
    }

    const { page } = this.props;
    const { viewport } = this;

    this.renderer = page.getOperatorList();

    return this.renderer
      .then((operatorList) => {
        const svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
        this.renderer = svgGfx.getSVG(operatorList, viewport)
          .then((svg) => {
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            element.appendChild(svg);
          })
          .catch(this.onRenderError);
      })
      .catch(this.onRenderError);
  }

  render() {
    return (
      <div
        className="ReactPDF__Page__svg"
        style={{
          display: 'block',
          backgroundColor: 'white',
        }}
        ref={this.drawPageOnContainer}
      />
    );
  }
}

PageSVG.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};
