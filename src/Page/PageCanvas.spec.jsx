import React from 'react';
import { mount } from 'enzyme';

import { PageCanvasInternal as PageCanvas } from './PageCanvas';

import failingPage from '../../__mocks__/_failing_page';

import { makeAsyncCallback, muteConsole, restoreConsole } from '../../test-utils';

/* eslint-disable comma-dangle */

describe('PageCanvas', () => {
  describe('loading', () => {
    it('calls onRenderError when failed to render canvas', async () => {
      const {
        func: onRenderError, promise: onRenderErrorPromise
      } = makeAsyncCallback();

      muteConsole();

      mount(
        <PageCanvas
          onRenderError={onRenderError}
          page={failingPage}
        />
      );

      expect.assertions(1);
      await expect(onRenderErrorPromise).resolves.toBeInstanceOf(Error);

      restoreConsole();
    });
  });
});
