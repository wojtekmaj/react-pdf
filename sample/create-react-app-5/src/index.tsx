import React from 'react';
import { createRoot } from 'react-dom/client';

import Sample from './Sample.js';

createRoot(document.getElementById('react-root') as HTMLDivElement).render(<Sample />);
