import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as pdfjs from 'pdfjs-dist';

import PageContext from '../PageContext';

import {
  errorOnDev,
  isCancelException,
  makePageCallback,
} from '../shared/utils';

import { isPage, isRotate } from '../shared/propTypes';

export class PageSVGInternal extends PureComponent {
  state = {
    svg: null,
  }

  componentDidMount() {
    this.renderSVG();
  }

  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess = () => {
    this.renderer = null;

    const { onRenderSuccess, page, scale } = this.props;

    if (onRenderSuccess) onRenderSuccess(makePageCallback(page, scale));
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError = (error) => {
    if (isCancelException(error)) {
      return;
    }

    errorOnDev(error);

    const { onRenderError } = this.props;

    if (onRenderError) onRenderError(error);
  }

  get viewport() {
    const { page, rotate, scale } = this.props;

    return page.getViewport({ scale, rotation: rotate });
  }

  renderSVG = () => {
    const { page } = this.props;

    this.renderer = page.getOperatorList();

    return this.renderer
      .then((operatorList) => {
        const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
        this.renderer = svgGfx.getSVG(operatorList, this.viewport)
          .then((svg) => {
            this.setState({ svg }, this.onRenderSuccess);
          })
          .catch(this.onRenderError);
      })
      .catch(this.onRenderError);
  }

  drawPageOnContainer = (element) => {
    const { svg } = this.state;

    if (!element || !svg) {
      return;
    }

    // Append SVG element to the main container, if this hasn't been done already
    if (!element.firstElementChild) {
      element.appendChild(svg);
    }

    const { width, height } = this.viewport;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  render() {
    const { width, height } = this.viewport;

    return (
      <div
        className="react-pdf__Page__svg"
        // Note: This cannot be shortened, as we need this function to be called with each render.
        ref={(ref) => this.drawPageOnContainer(ref)}
        style={{
          display: 'block',
          backgroundColor: 'white',
          overflow: 'hidden',
          width,
          height,
          userSelect: 'none',
        }}
      />
    );
  }
}

PageSVGInternal.propTypes = {
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

export default function PageSVG(props) {
  return (
    <PageContext.Consumer>
      {(context) => <PageSVGInternal {...context} {...props} />}
    </PageContext.Consumer>
  );
}
