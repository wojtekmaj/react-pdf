import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

import type { OutlineContextType } from './shared/types';

const OutlineContext = createContext<OutlineContextType>(null);

export default OutlineContext;

export function useOutline() {
  const context = useContext(OutlineContext);
  invariant(context, 'Unable to find Outline context.');
  return context;
}
