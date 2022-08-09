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
import invariant from 'tiny-invariant';

const DEFAULT_LINK_REL = 'noopener noreferrer nofollow';

export default class LinkService {
  constructor() {
    this.externalLinkTarget = null;
    this.externalLinkRel = null;
  }

  setDocument(pdfDocument) {
    this.pdfDocument = pdfDocument;
  }

  setViewer(pdfViewer) {
    this.pdfViewer = pdfViewer;
  }

  setExternalLinkRel(externalLinkRel) {
    this.externalLinkRel = externalLinkRel;
  }

  setExternalLinkTarget(externalLinkTarget) {
    this.externalLinkTarget = externalLinkTarget;
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

  goToDestination(dest) {
    new Promise((resolve) => {
      if (typeof dest === 'string') {
        this.pdfDocument.getDestination(dest).then(resolve);
      } else if (Array.isArray(dest)) {
        resolve(dest);
      } else {
        dest.then(resolve);
      }
    }).then((explicitDest) => {
      invariant(Array.isArray(explicitDest), `"${explicitDest}" is not a valid destination array.`);

      const destRef = explicitDest[0];

      new Promise((resolve) => {
        if (destRef instanceof Object) {
          this.pdfDocument
            .getPageIndex(destRef)
            .then((pageIndex) => {
              resolve(pageIndex);
            })
            .catch(() => {
              invariant(false, `"${destRef}" is not a valid page reference.`);
            });
        } else if (typeof destRef === 'number') {
          resolve(destRef);
        } else {
          invariant(false, `"${destRef}" is not a valid destination reference.`);
        }
      }).then((pageIndex) => {
        const pageNumber = pageIndex + 1;

        invariant(
          pageNumber >= 1 && pageNumber <= this.pagesCount,
          `"${pageNumber}" is not a valid page number.`,
        );

        this.pdfViewer.scrollPageIntoView({
          dest,
          pageIndex,
          pageNumber,
        });
      });
    });
  }

  navigateTo(dest) {
    this.goToDestination(dest);
  }

  goToPage() {}

  addLinkAttributes(link, url, newWindow) {
    link.href = url;
    link.rel = this.externalLinkRel || DEFAULT_LINK_REL;
    link.target = newWindow ? '_blank' : this.externalLinkTarget || '';
  }

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
