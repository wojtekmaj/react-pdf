'use client';

import { useRef } from 'react';

import { isDefined } from '../utils.js';

export default function useCachedValue<T>(getter: () => T): () => T {
  const ref = useRef<T>();

  const currentValue = ref.current;

  if (isDefined(currentValue)) {
    return () => currentValue;
  }

  return () => {
    const value = getter();

    ref.current = value;

    return value;
  };
}
