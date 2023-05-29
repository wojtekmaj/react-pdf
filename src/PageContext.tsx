import { createContext, useContext } from 'react';

import type { PageContextType } from './shared/types';
import invariant from 'tiny-invariant';

const PageContext = createContext<PageContextType>(null);

export default PageContext;

export function usePage() {
  const context = useContext(PageContext);
  invariant(context, 'Unable to find Page context.');
  return context;
}
