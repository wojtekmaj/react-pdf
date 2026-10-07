import { describe, expect, it } from 'vitest';

import areDocumentInputsEqual from './areDocumentInputsEqual.js';

describe('areDocumentInputsEqual', () => {
  it('compares equivalent nested records and arrays by value', () => {
    const first = [
      { url: '/document.pdf' },
      { headers: { authorization: 'token' }, layers: ['text', 'canvas'] },
    ];
    const second = [
      { url: '/document.pdf' },
      { layers: ['text', 'canvas'], headers: { authorization: 'token' } },
    ];

    expect(areDocumentInputsEqual(first, second)).toBe(true);
  });

  it('distinguishes document sources and nested option values', () => {
    const first = ['/first.pdf', { httpHeaders: { Authorization: 'first token' } }];
    const changedSource = ['/second.pdf', { httpHeaders: { Authorization: 'first token' } }];
    const changedOptions = ['/first.pdf', { httpHeaders: { Authorization: 'second token' } }];

    expect(areDocumentInputsEqual(first, changedSource)).toBe(false);
    expect(areDocumentInputsEqual(first, changedOptions)).toBe(false);
  });

  it.each([
    { name: 'Blobs', create: () => new Blob(['PDF']) },
    { name: 'ArrayBuffers', create: () => new ArrayBuffer(4) },
    { name: 'typed arrays', create: () => new Uint8Array([1, 2, 3]) },
    { name: 'functions', create: () => () => 'PDF' },
  ])('compares $name by identity, including inside plain records', ({ create }) => {
    const value = create();
    const distinct = create();

    expect(areDocumentInputsEqual(value, value)).toBe(true);
    expect(areDocumentInputsEqual(value, distinct)).toBe(false);
    expect(areDocumentInputsEqual({ value }, { value })).toBe(true);
    expect(areDocumentInputsEqual({ value }, { value: distinct })).toBe(false);
  });

  it('compares worker-like class instances by identity', () => {
    class Worker {
      name = 'PDF worker';
    }

    const worker = new Worker();

    expect(areDocumentInputsEqual({ worker }, { worker })).toBe(true);
    expect(areDocumentInputsEqual({ worker }, { worker: new Worker() })).toBe(false);
  });
});
