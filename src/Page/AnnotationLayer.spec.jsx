import React from 'react';
import { mount, shallow } from 'enzyme';

import { pdfjs } from '../entry.jest';

import { AnnotationLayerInternal as AnnotationLayer } from './AnnotationLayer';
import LinkService from '../LinkService';
import eventBus from '../eventBus';

import failingPage from '../../__mocks__/_failing_page';

import {
  loadPDF, makeAsyncCallback, muteConsole, restoreConsole,
} from '../../test-utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

describe('AnnotationLayer', () => {
  const linkService = new LinkService({ eventBus });

  // Loaded page
  let page;
  let page2;

  // Loaded page text items
  let desiredAnnotations;
  let desiredAnnotations2;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer }).promise;

    page = await pdf.getPage(1);
    desiredAnnotations = await page.getAnnotations();

    page2 = await pdf.getPage(2);
    desiredAnnotations2 = await page2.getAnnotations();
  });

  describe('loading', () => {
    it('loads annotations and calls onGetAnnotationsSuccess callback properly', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise,
      } = makeAsyncCallback();

      mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />,
      );

      expect.assertions(1);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);
    });

    it('calls onGetAnnotationsError when failed to load annotations', async () => {
      const {
        func: onGetAnnotationsError, promise: onGetAnnotationsErrorPromise,
      } = makeAsyncCallback();

      muteConsole();

      mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsError={onGetAnnotationsError}
          page={failingPage}
        />,
      );

      expect.assertions(1);
      await expect(onGetAnnotationsErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces annotations properly when page is changed', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise,
      } = makeAsyncCallback();

      const mountedComponent = mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />,
      );

      expect.assertions(2);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);

      const {
        func: onGetAnnotationsSuccess2, promise: onGetAnnotationsSuccessPromise2,
      } = makeAsyncCallback();

      mountedComponent.setProps({
        onGetAnnotationsSuccess: onGetAnnotationsSuccess2,
        page: page2,
      });

      await expect(onGetAnnotationsSuccessPromise2).resolves.toMatchObject(desiredAnnotations2);
    });

    it('throws an error when placed outside Page', () => {
      muteConsole();
      expect(() => shallow(<AnnotationLayer />)).toThrow();
      restoreConsole();
    });
  });

  describe('rendering', () => {
    it('renders annotations properly', async () => {
      const {
        func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
          page={page}
        />,
      );

      expect.assertions(1);

      return onRenderAnnotationLayerSuccessPromise.then(() => {
        component.update();
        const renderedLayer = component.getDOMNode();
        const annotationItems = [...renderedLayer.children];

        expect(annotationItems).toHaveLength(desiredAnnotations.length);
      });
    });

    it.each`
      linkServiceTarget | target
      ${1}              | ${'_self'}
      ${2}              | ${'_blank'}
      ${3}              | ${'_parent'}
      ${4}              | ${'_top'}
    `('renders all links with target $target given externalLinkTarget = $target', ({
      linkServiceTarget, target,
    }) => {
      const {
        func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();
      const customLinkService = new LinkService();
      customLinkService.externalLinkTarget = linkServiceTarget;

      const component = mount(
        <AnnotationLayer
          linkService={customLinkService}
          onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
          page={page}
        />,
      );

      expect.assertions(desiredAnnotations.length);

      return onRenderAnnotationLayerSuccessPromise.then(() => {
        component.update();
        const renderedLayer = component.getDOMNode();
        const annotationItems = [...renderedLayer.children];
        const annotationLinkItems = annotationItems
          .map((item) => item.firstChild)
          .filter((item) => item.tagName === 'A');

        annotationLinkItems.forEach((link) => expect(link.getAttribute('target')).toBe(target));
      });
    });

    it('renders annotations at a given rotation', async () => {
      const {
        func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();
      const rotate = 90;

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
          page={page}
          rotate={rotate}
        />,
      );

      expect.assertions(1);
      return onRenderAnnotationLayerSuccessPromise.then(() => {
        component.update();
        const { viewport } = component.instance();

        expect(viewport.rotation).toEqual(rotate);
      });
    });

    it('renders annotations at a given scale', async () => {
      const {
        func: onRenderAnnotationLayerSuccess, promise: onRenderAnnotationLayerSuccessPromise,
      } = makeAsyncCallback();
      const scale = 2;

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationLayerSuccess={onRenderAnnotationLayerSuccess}
          page={page}
          scale={scale}
        />,
      );

      expect.assertions(1);
      return onRenderAnnotationLayerSuccessPromise.then(() => {
        component.update();
        const { viewport } = component.instance();

        expect(viewport.scale).toEqual(scale);
      });
    });
  });
});
