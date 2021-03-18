/* Copyright 2015 Mozilla Foundation
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

/* eslint-disable class-methods-use-this, no-empty-function */

export default class SimpleLinkService {
  constructor() {
    this.externalLinkTarget = null;
    this.externalLinkRel = null;
    this.externalLinkEnabled = true;
  }

  setDocument(pdfDocument) {
    this.pdfDocument = pdfDocument;
  }

  setViewer(pdfViewer) {
    this.pdfViewer = pdfViewer;
  }

  setHistory() {}

  get pagesCount() {
    return this.pdfDocument ? this.pdfDocument.numPages : 0;
  }

  get page() {
    return this.pdfViewer.currentPageNumber;
  }

  set page(value) {
    this.pdfViewer.currentPageNumber = value;
  }

  get rotation() {
    return 0;
  }

  set rotation(value) {}

  async goToDestination(dest) {
    const destRef = dest[0];
    let pageNumber;

    if (destRef instanceof Object) {
      try {
        const pageIndex = await this.pdfDocument.getPageIndex(destRef);
        pageNumber = pageIndex + 1;
      } catch (error) {
        throw new Error(`"${destRef}" is not a valid destination reference.`);
      }
    } else if (typeof destRef === 'number') {
      pageNumber = destRef + 1;
    } else {
      throw new Error(`"${destRef}" is not a valid destination reference.`);
    }

    if (!pageNumber || pageNumber < 1 || pageNumber > this.pagesCount) {
      throw new Error(`"${pageNumber}" is not a valid page number.`);
    }

    this.pdfViewer.scrollPageIntoView({
      pageNumber,
    });
  }

  navigateTo(dest) {
    this.goToDestination(dest);
  }

  goToPage() {}

  getDestinationHash() {
    return '#';
  }

  getAnchorUrl() {
    return '#';
  }

  setHash() {}

  executeNamedAction() {}

  cachePageRef() {}

  isPageVisible() {
    return true;
  }

  isPageCached() {
    return true;
  }
}
