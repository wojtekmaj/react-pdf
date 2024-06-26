import { useContext } from 'react';

import DocumentContext from '../../DocumentContext.js';

import type { DocumentContextType } from '../types.js';

export default function useDocumentContext(): DocumentContextType {
  return useContext(DocumentContext);
}
