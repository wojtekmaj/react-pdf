import { useContext } from 'react';

import PageContext from '../../PageContext.js';

import type { PageContextType } from '../types.js';

export default function usePageContext(): PageContextType {
  return useContext(PageContext);
}
