import React from 'react';
import { createRoot } from 'react-dom/client';

import Sample from './Sample.tsx';

createRoot(document.getElementById('react-root')!).render(<Sample />);
