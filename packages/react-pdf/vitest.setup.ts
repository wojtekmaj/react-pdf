import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import 'vitest-canvas-mock';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
