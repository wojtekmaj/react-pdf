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

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type {
  Dest,
  ResolvedDest,
  ExternalLinkRel,
  ExternalLinkTarget,
  ScrollPageIntoViewArgs,
} from './shared/types.js';

import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces.js';

const DEFAULT_LINK_REL = 'noopener noreferrer nofollow';

type PDFViewer = {
  currentPageNumber?: number;
  scrollPageIntoView: (args: ScrollPageIntoViewArgs) => void;
};

export default class LinkService implements IPDFLinkService {
  externalLinkEnabled: boolean;
  externalLinkRel?: ExternalLinkRel;
  externalLinkTarget?: ExternalLinkTarget;
  isInPresentationMode: boolean;
  pdfDocument?: PDFDocumentProxy | null;
  pdfViewer?: PDFViewer | null;

  constructor() {
    this.externalLinkEnabled = true;
    this.externalLinkRel = undefined;
    this.externalLinkTarget = undefined;
    this.isInPresentationMode = false;
    this.pdfDocument = undefined;
    this.pdfViewer = undefined;
  }

  setDocument(pdfDocument: PDFDocumentProxy) {
    this.pdfDocument = pdfDocument;
  }

  setViewer(pdfViewer: PDFViewer) {
    this.pdfViewer = pdfViewer;
  }

  setExternalLinkRel(externalLinkRel?: ExternalLinkRel) {
    this.externalLinkRel = externalLinkRel;
  }

  setExternalLinkTarget(externalLinkTarget?: ExternalLinkTarget) {
    this.externalLinkTarget = externalLinkTarget;
  }

  setHistory() {
    // Intentionally empty
  }

  get pagesCount() {
    return this.pdfDocument ? this.pdfDocument.numPages : 0;
  }

  get page() {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    return this.pdfViewer.currentPageNumber || 0;
  }

  set page(value: number) {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    this.pdfViewer.currentPageNumber = value;
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get rotation() {
    return 0;
  }

  set rotation(value) {
    // Intentionally empty
  }

  goToDestination(dest: Dest): Promise<void> {
    return new Promise<ResolvedDest | null>((resolve) => {
      invariant(this.pdfDocument, 'PDF document not loaded.');

      invariant(dest, 'Destination is not specified.');

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

      new Promise<number>((resolve) => {
        invariant(this.pdfDocument, 'PDF document not loaded.');

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

        invariant(this.pdfViewer, 'PDF viewer is not initialized.');

        invariant(
          pageNumber >= 1 && pageNumber <= this.pagesCount,
          `"${pageNumber}" is not a valid page number.`,
        );

        this.pdfViewer.scrollPageIntoView({
          dest: explicitDest,
          pageIndex,
          pageNumber,
        });
      });
    });
  }

  navigateTo(dest: Dest) {
    this.goToDestination(dest);
  }

  goToPage(pageNumber: number) {
    const pageIndex = pageNumber - 1;

    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    invariant(
      pageNumber >= 1 && pageNumber <= this.pagesCount,
      `"${pageNumber}" is not a valid page number.`,
    );

    this.pdfViewer.scrollPageIntoView({
      pageIndex,
      pageNumber,
    });
  }

  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow: boolean) {
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

  setHash() {
    // Intentionally empty
  }

  executeNamedAction() {
    // Intentionally empty
  }

  cachePageRef() {
    // Intentionally empty
  }

  isPageVisible() {
    return true;
  }

  isPageCached() {
    return true;
  }

  executeSetOCGState() {
    // Intentionally empty
  }
}
