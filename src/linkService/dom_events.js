/* Copyright 2016 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventBus } from './ui_utils';

// Attaching to the application event bus to dispatch events to the DOM for
// backwards viewer API compatibility.
function attachDOMEventsToEventBus(eventBus) {
  eventBus.on('documentload', function() {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('documentload', true, true, {});
    window.dispatchEvent(event);
  });
  eventBus.on('pagerendered', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('pagerendered', true, true, {
      pageNumber: evt.pageNumber,
      cssTransform: evt.cssTransform,
    });
    evt.source.div.dispatchEvent(event);
  });
  eventBus.on('textlayerrendered', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('textlayerrendered', true, true, {
      pageNumber: evt.pageNumber,
    });
    evt.source.textLayerDiv.dispatchEvent(event);
  });
  eventBus.on('pagechange', function(evt) {
    let event = document.createEvent('UIEvents');
    event.initUIEvent('pagechange', true, true, window, 0);
    event.pageNumber = evt.pageNumber;
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('pagesinit', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('pagesinit', true, true, null);
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('pagesloaded', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('pagesloaded', true, true, {
      pagesCount: evt.pagesCount,
    });
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('scalechange', function(evt) {
    let event = document.createEvent('UIEvents');
    event.initUIEvent('scalechange', true, true, window, 0);
    event.scale = evt.scale;
    event.presetValue = evt.presetValue;
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('updateviewarea', function(evt) {
    let event = document.createEvent('UIEvents');
    event.initUIEvent('updateviewarea', true, true, window, 0);
    event.location = evt.location;
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('find', function(evt) {
    if (evt.source === window) {
      return; // event comes from FirefoxCom, no need to replicate
    }
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('find' + evt.type, true, true, {
      query: evt.query,
      phraseSearch: evt.phraseSearch,
      caseSensitive: evt.caseSensitive,
      highlightAll: evt.highlightAll,
      findPrevious: evt.findPrevious,
    });
    window.dispatchEvent(event);
  });
  eventBus.on('attachmentsloaded', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('attachmentsloaded', true, true, {
      attachmentsCount: evt.attachmentsCount,
    });
    evt.source.container.dispatchEvent(event);
  });
  eventBus.on('sidebarviewchanged', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('sidebarviewchanged', true, true, {
      view: evt.view,
    });
    evt.source.outerContainer.dispatchEvent(event);
  });
  eventBus.on('pagemode', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('pagemode', true, true, {
      mode: evt.mode,
    });
    evt.source.pdfViewer.container.dispatchEvent(event);
  });
  eventBus.on('namedaction', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('namedaction', true, true, {
      action: evt.action,
    });
    evt.source.pdfViewer.container.dispatchEvent(event);
  });
  eventBus.on('presentationmodechanged', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('presentationmodechanged', true, true, {
      active: evt.active,
      switchInProgress: evt.switchInProgress,
    });
    window.dispatchEvent(event);
  });
  eventBus.on('outlineloaded', function(evt) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent('outlineloaded', true, true, {
      outlineCount: evt.outlineCount,
    });
    evt.source.container.dispatchEvent(event);
  });
}

let globalEventBus = null;
function getGlobalEventBus() {
  if (globalEventBus) {
    return globalEventBus;
  }
  globalEventBus = new EventBus();
  attachDOMEventsToEventBus(globalEventBus);
  return globalEventBus;
}

export {
  attachDOMEventsToEventBus,
  getGlobalEventBus,
};
