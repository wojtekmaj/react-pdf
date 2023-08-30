import { useContext } from 'react';

import DocumentContext from '../../DocumentContext.js';

export default function useDocumentContext() {
  return useContext(DocumentContext);
}
