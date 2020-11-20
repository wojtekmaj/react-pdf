import {
  pdfjs,
  Document,
  Outline,
  Page,
} from './entry';

describe('default entry', () => {
  describe('has pdfjs exported properly', () => {
    it('has pdfjs exported properly', () => {
      expect(pdfjs).toBeInstanceOf(Object);
    });

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
});
