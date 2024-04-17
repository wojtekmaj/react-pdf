import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Test from './Test.js';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

createRoot(root).render(
  <StrictMode>
    <Test />
  </StrictMode>,
);
