import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

import type { DocumentContextType } from './shared/types';

const DocumentContext = createContext<DocumentContextType>(null);

export default DocumentContext;

export function useDocument() {
  const context = useContext(DocumentContext);
  invariant(context, 'Unable to find Document context.');
  return context;
}
