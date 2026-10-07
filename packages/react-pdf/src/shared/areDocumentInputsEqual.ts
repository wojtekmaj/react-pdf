import { isEqualWith, isPlainObject } from 'es-toolkit/predicate';

export default function areDocumentInputsEqual(first: unknown, second: unknown): boolean {
  return isEqualWith(first, second, (a: unknown, b: unknown) => {
    if ((Array.isArray(a) && Array.isArray(b)) || (isPlainObject(a) && isPlainObject(b))) {
      return;
    }

    // Binary data, workers and range transports represent distinct resources.
    return Object.is(a, b);
  });
}
