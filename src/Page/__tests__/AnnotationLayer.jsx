import React from 'react';
import { mount } from 'enzyme';

import { pdfjs } from '../../entry.jest';

import { AnnotationLayerInternal as AnnotationLayer } from '../AnnotationLayer';
import LinkService from '../../LinkService';

import failingPage from '../../../__mocks__/_failing_page';

import {
  loadPDF, makeAsyncCallback, muteConsole, restoreConsole,
} from '../../__tests__/utils';

const pdfFile = loadPDF('./__mocks__/_pdf.pdf');

/* eslint-disable comma-dangle */

describe('AnnotationLayer', () => {
  const linkService = new LinkService();

  // Loaded page
  let page;
  let page2;

  // Loaded page text items
  let desiredAnnotations;
  let desiredAnnotations2;

  beforeAll(async () => {
    const pdf = await pdfjs.getDocument({ data: pdfFile.arrayBuffer });

    page = await pdf.getPage(1);
    desiredAnnotations = await page.getAnnotations();

    page2 = await pdf.getPage(2);
    desiredAnnotations2 = await page2.getAnnotations();
  });

  describe('loading', () => {
    it('loads annotations and calls onGetAnnotationsSuccess callback properly', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise
      } = makeAsyncCallback();

      mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />
      );

      expect.assertions(1);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);
    });

    it('calls onGetAnnotationsError when failed to load annotations', async () => {
      const {
        func: onGetAnnotationsError, promise: onGetAnnotationsErrorPromise
      } = makeAsyncCallback();

      muteConsole();

      mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsError={onGetAnnotationsError}
          page={failingPage}
        />
      );

      expect.assertions(1);
      await expect(onGetAnnotationsErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });

    it('replaces annotations properly when page is changed', async () => {
      const {
        func: onGetAnnotationsSuccess, promise: onGetAnnotationsSuccessPromise
      } = makeAsyncCallback();

      const mountedComponent = mount(
        <AnnotationLayer
          linkService={linkService}
          onGetAnnotationsSuccess={onGetAnnotationsSuccess}
          page={page}
        />
      );

      expect.assertions(2);
      await expect(onGetAnnotationsSuccessPromise).resolves.toMatchObject(desiredAnnotations);

      const {
        func: onGetAnnotationsSuccess2, promise: onGetAnnotationsSuccessPromise2
      } = makeAsyncCallback();

      mountedComponent.setProps({
        onGetAnnotationsSuccess: onGetAnnotationsSuccess2,
        page: page2,
      });

      await expect(onGetAnnotationsSuccessPromise2).resolves.toMatchObject(desiredAnnotations2);
    });
  });

  describe('rendering', () => {
    it('renders annotations properly', async () => {
      const {
        func: onRenderAnnotationsSuccess, promise: onRenderAnnotationsSuccessPromise,
      } = makeAsyncCallback();

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationsSuccess={onRenderAnnotationsSuccess}
          page={page}
        />
      );

      expect.assertions(1);

      return onRenderAnnotationsSuccessPromise.then(() => {
        component.update();
        const annotationItems = component.children();

        expect(annotationItems).toHaveLength(desiredAnnotations.length);
      });
    });

    it('renders annotations at a given rotation', async () => {
      const {
        func: onRenderAnnotationsSuccess, promise: onRenderAnnotationsSuccessPromise,
      } = makeAsyncCallback();
      const rotate = 90;

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationsSuccess={onRenderAnnotationsSuccess}
          page={page}
          rotate={rotate}
        />
      );

      expect.assertions(1);
      return onRenderAnnotationsSuccessPromise.then(() => {
        component.update();
        const { viewport } = component.instance();

        expect(viewport.rotation).toEqual(rotate);
      });
    });

    it('renders annotations at a given scale', async () => {
      const {
        func: onRenderAnnotationsSuccess, promise: onRenderAnnotationsSuccessPromise,
      } = makeAsyncCallback();
      const scale = 2;

      const component = mount(
        <AnnotationLayer
          linkService={linkService}
          onRenderAnnotationsSuccess={onRenderAnnotationsSuccess}
          page={page}
          scale={scale}
        />
      );

      expect.assertions(1);
      return onRenderAnnotationsSuccessPromise.then(() => {
        component.update();
        const { viewport } = component.instance();

        expect(viewport.scale).toEqual(scale);
      });
    });
  });
});
