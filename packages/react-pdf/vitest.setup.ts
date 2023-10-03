import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import 'vitest-canvas-mock';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

document.body.style.setProperty('--react-pdf-annotation-layer', '1');
document.body.style.setProperty('--react-pdf-text-layer', '1');
