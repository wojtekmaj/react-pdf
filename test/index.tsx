import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Test from './Test.js';

createRoot(document.getElementById('react-root')!).render(
  <StrictMode>
    <Test />
  </StrictMode>,
);
