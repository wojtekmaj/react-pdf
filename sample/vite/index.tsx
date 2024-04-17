import { createRoot } from 'react-dom/client';

import Sample from './Sample.js';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

createRoot(root).render(<Sample />);
