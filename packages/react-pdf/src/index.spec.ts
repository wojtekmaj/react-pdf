import { describe, expect, it } from 'vitest';
import { pdfjs, Document, Outline, Page, Thumbnail } from './index.js';

describe('default entry', () => {
  describe('has pdfjs exported properly', () => {
    it('has pdfjs.version exported properly', () => {
      expect(typeof pdfjs.version).toBe('string');
    });

    it('has GlobalWorkerOptions exported properly', () => {
      expect(typeof pdfjs.GlobalWorkerOptions).toBe('object');
    });
  });

  it('has Document exported properly', () => {
    expect(Document).toBeInstanceOf(Object);
  });

  it('has Outline exported properly', () => {
    expect(Outline).toBeInstanceOf(Object);
  });

  it('has Page exported properly', () => {
    expect(Page).toBeInstanceOf(Object);
  });

  it('has Thumbnail exported properly', () => {
    expect(Thumbnail).toBeInstanceOf(Object);
  });
});
