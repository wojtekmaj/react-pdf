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
  pageLabels: (string | null)[] | null;
  private _syncHashEnabled: boolean;

  constructor() {
    this.externalLinkEnabled = true;
    this.externalLinkRel = undefined;
    this.externalLinkTarget = undefined;
    this.isInPresentationMode = false;
    this.pdfDocument = undefined;
    this.pdfViewer = undefined;
    this.pageLabels = null;
    this._syncHashEnabled = false;
  }

  /**
   * Enable or disable URL hash synchronization.
   */
  setSyncHashEnabled(enabled: boolean): void {
    this._syncHashEnabled = enabled;
  }

  /**
   * Set page labels for label-based navigation.
   */
  setPageLabels(labels: (string | null)[] | null): void {
    this.pageLabels = labels;
  }

  /**
   * Get page number from a page label.
   * Returns the 1-based page number, or null if not found.
   */
  getPageNumberFromLabel(label: string): number | null {
    if (!this.pageLabels) {
      // No labels available, try parsing as number
      const pageNum = parseInt(label, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.pagesCount) {
        return pageNum;
      }
      return null;
    }

    // Search for the label in the labels array
    const index = this.pageLabels.findIndex((l) => l === label);
    if (index !== -1) {
      return index + 1; // Convert 0-based index to 1-based page number
    }

    // If not found as label, try parsing as number
    const pageNum = parseInt(label, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.pagesCount) {
      return pageNum;
    }

    return null;
  }

  /**
   * Get page label for a page number.
   * Returns the label, or the page number as string if no label exists.
   */
  getPageLabel(pageNumber: number): string {
    if (this.pageLabels && this.pageLabels[pageNumber - 1]) {
      return this.pageLabels[pageNumber - 1] as string;
    }
    return String(pageNumber);
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

  /**
   * Update the URL hash with the current page label.
   * Called when navigation occurs if hash sync is enabled.
   */
  setHash(hash?: string): void {
    if (!this._syncHashEnabled) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    // If a hash is provided, use it directly
    if (hash) {
      window.history.replaceState(null, '', hash);
      return;
    }

    // Otherwise, update hash based on current page
    const pageNumber = this.page;
    if (pageNumber > 0) {
      const label = this.getPageLabel(pageNumber);
      window.history.replaceState(null, '', `#page=${encodeURIComponent(label)}`);
    }
  }

  /**
   * Parse the URL hash and navigate to the specified page.
   * Supports formats: #page=<label> or #page=<number>
   * Returns the page number if found, or null.
   */
  parseHashAndNavigate(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const hash = window.location.hash;
    if (!hash) {
      return null;
    }

    // Parse #page=<label> format
    const match = hash.match(/^#page=(.+)$/);
    if (!match || !match[1]) {
      return null;
    }

    const label = decodeURIComponent(match[1]);
    const pageNumber = this.getPageNumberFromLabel(label);

    if (pageNumber !== null) {
      this.goToPage(pageNumber);
      return pageNumber;
    }

    return null;
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
