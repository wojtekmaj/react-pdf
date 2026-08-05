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
import { EventBus, SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer.mjs';
import invariant from 'tiny-invariant';

import type { PDFDocumentProxy } from 'pdfjs-dist';
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

export default class LinkService extends SimpleLinkService {
  declare pdfDocument: PDFDocumentProxy | null;
  declare pdfViewer: PDFViewer | null;

  #externalLinkRel?: ExternalLinkRel;
  #externalLinkTarget?: ExternalLinkTarget;

  constructor() {
    super({ eventBus: new EventBus() });
  }

  override setDocument(pdfDocument: PDFDocumentProxy): void {
    this.pdfDocument = pdfDocument;
  }

  override setViewer(pdfViewer: PDFViewer): void {
    this.pdfViewer = pdfViewer;
  }

  setExternalLinkRel(externalLinkRel?: ExternalLinkRel): void {
    this.#externalLinkRel = externalLinkRel;
  }

  setExternalLinkTarget(externalLinkTarget?: ExternalLinkTarget): void {
    this.#externalLinkTarget = externalLinkTarget;
  }

  override get pagesCount(): number {
    return this.pdfDocument ? this.pdfDocument.numPages : 0;
  }

  override get page(): number {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    return this.pdfViewer.currentPageNumber || 0;
  }

  override set page(value: number) {
    invariant(this.pdfViewer, 'PDF viewer is not initialized.');

    this.pdfViewer.currentPageNumber = value;
  }

  override addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow?: boolean): void {
    link.href = url;
    link.rel = this.#externalLinkRel || DEFAULT_LINK_REL;
    link.target = newWindow ? '_blank' : this.#externalLinkTarget || '';
  }

  override goToDestination(dest: Dest): Promise<void> {
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

  override goToPage(pageNumber: number): void {
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

  isPageVisible(): boolean {
    return true;
  }

  isPageCached(): boolean {
    return true;
  }

  navigateTo(dest: Dest): void {
    this.goToDestination(dest);
  }

  override async executeSetOCGState(): Promise<void> {
    // Intentionally empty
  }
}
