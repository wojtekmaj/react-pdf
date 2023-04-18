import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Test from './Test';

createRoot(document.getElementById('react-root') as HTMLDivElement).render(
  <StrictMode>
    <Test />
  </StrictMode>,
);
