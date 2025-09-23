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
import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces.js';
import type {
  Dest,
  ExternalLinkRel,
  ExternalLinkTarget,
  ResolvedDest,
  ScrollPageIntoViewArgs,
} from './shared/types.js';

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

  setDocument(pdfDocument: PDFDocumentProxy): void {
    this.pdfDocument = pdfDocument;
  }

  setViewer(pdfViewer: PDFViewer): void {
    this.pdfViewer = pdfViewer;
  }

  setExternalLinkRel(externalLinkRel?: ExternalLinkRel): void {
    this.externalLinkRel = externalLinkRel;
  }

  setExternalLinkTarget(externalLinkTarget?: ExternalLinkTarget): void {
    this.externalLinkTarget = externalLinkTarget;
  }

  setHash(): void {
    // Intentionally empty
  }

  setHistory(): void {
    // Intentionally empty
  }

  get pagesCount(): number {
    return this.pdfDocument ? this.pdfDocument.numPages : 0;
  }

  get page(): number {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    return this.pdfViewer.currentPageNumber || 0;
  }

  set page(value: number) {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    this.pdfViewer.currentPageNumber = value;
  }

  get rotation(): number {
    return 0;
  }

  set rotation(_value) {
    // Intentionally empty
  }

  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow: boolean): void {
    link.href = url;
    link.rel = this.externalLinkRel || DEFAULT_LINK_REL;
    link.target = newWindow ? '_blank' : this.externalLinkTarget || '';
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

  goToPage(pageNumber: number): void {
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

  goToXY(): void {
    // Intentionally empty
  }

  cachePageRef(): void {
    // Intentionally empty
  }

  getDestinationHash(): string {
    return '#';
  }

  getAnchorUrl(): string {
    return '#';
  }

  executeNamedAction(): void {
    // Intentionally empty
  }

  executeSetOCGState(): void {
    // Intentionally empty
  }

  isPageVisible(): boolean {
    return true;
  }

  isPageCached(): boolean {
    return true;
  }

  navigateTo(dest: Dest): void {
    this.goToDestination(dest);
  }
}
