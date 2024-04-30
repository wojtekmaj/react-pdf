import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'core-js/proposals/promise-with-resolvers';

afterEach(() => {
  cleanup();
});

document.body.style.setProperty('--react-pdf-annotation-layer', '1');
document.body.style.setProperty('--react-pdf-text-layer', '1');
